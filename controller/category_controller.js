const db = require('../models');
const helper = require('../helper/index');
const vanu = db.venues;
const cate = db.categories;
const mainCategory = db.mainCategory;
const fileupload = helper.file_upload;
const constant = require('../config/constant');

cate.belongsTo(vanu, { foreignKey: 'venue_id' });
cate.belongsTo(mainCategory, { foreignKey: 'main_category_id' });
module.exports = {

  cate_list: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const results = await cate.findAll({
          order: [['id', 'DESC']],
          include: [
            {
              model: vanu,
              attributes: [
                'name'
              ]
            },
            {
              model: mainCategory,
              attributes: [
                'title'
              ]
            }
          ]
        });

        res.render('category/list', { response: results, msg: req.flash('msg'), title: "category" });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  category: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const results = await vanu.findAll();
        const mainCategorys = await mainCategory.findAll();
        res.render('category/addcate', { response: results, title: "category", mainCategory: mainCategorys });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  add_cate: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        let data = "";
        if(req.files.image){
          data = constant.image_url + fileupload(req.files.image);
        }
        const results = await cate.create({
          // venueId: req.body.venueId,
          main_category_id: req.body.main_category_id,
          name: req.body.name,
          image: data
        })
        req.flash('msg', "category added successfully");
        res.redirect('/category_view');
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  edit_cate: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const results = await cate.findOne({
          where: { id: req.query.id }
        })
        const drop = await vanu.findAll();
        const mainCategorys = await mainCategory.findAll();
        res.render('category/editcate', { response: results, drop: drop, mainCategory: mainCategorys, title: "category" });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  update_cate: async function (req, res) {

    const data = req.body;
    const files = req.files;
    data.files = files;
    try {
      if (req.session.auth && req.session.auth == true) {
        const user = await cate.findOne({
          where: {
            id: req.body.id
          }
        });
        let old_image = user.dataValues.image;

        let image_url = '';
        //console.log(data.files.image);return false;
        if (data.files.image != '' && data.files.image) {

          let image = data.files.image;
          image_url = data.files.image.name;
          data.files.image.mv(process.cwd() + '/public/images/' + data.files.image.name, function (err) {
            if (err)
              return res.status(500).send(err);
            //res.send('File uploaded!');
          });
          old_image = constant.image_url + image_url;
        }
        const save = await cate.update(
          {
            // venueId: req.body.venueId,
            name: req.body.name,
            image: old_image
          },
          { where: { id: req.body.id } }

        );
        //console.log(save);return false;
        req.flash('msg', "category updated successfully");
        res.redirect('/category_view');
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  }

}
