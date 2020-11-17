const db = require('../models');
const helper = require('../helper/index');
const Users = db.users;
const cate = db.categories;
const vanue = db.venues;
const Terminals = db.terminals;
const password = helper.crypt;
const subcate = db.subcategories;
const product = db.products;
let Sequelize = require('sequelize');
let Op = Sequelize.Op;
const fileupload = helper.file_upload;
const constant = require('../config/constant');

module.exports = {

  add_user: function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {

        res.render('users/adduser', { title: 'users' });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  user_list: async function (req, res) {

    try {
      if (req.session.auth && req.session.auth == true) {
        let users;
        if (req.query.start && req.query.end) {
          users = await vanue.findAll({
            where: {
              createdAt: {
                [Op.between]: [req.query.start, req.query.end]
              },
              user_type : 1
            },

            order: [['id', 'DESC']],
          });
        } else {
          users = await vanue.findAll({
            where : {
              user_type : 1
            },
            order: [['id', 'DESC']],
          });
        }

        res.render('users/list', { response: users, msg: req.flash('msg'), title: 'users' });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {

      throw e;
    }
  },

  add_users: async function (req, res) {
    const crypt = password(req.body.password);
    const data = constant.image_url + fileupload(req.files.image);
    //console.log(data); return;
    try {
      if (req.session.auth && req.session.auth == true) {
        const user = await vanue.create({
          name: req.body.name,
          email: req.body.email,
          password: crypt,
          dob: req.body.dob,
          image: data,
          card_verified: 1,
          user_type : 1
        });
        req.flash('msg', "user add successfully")
        res.redirect('/users_list');
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  edit_user: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const users = await vanue.findOne({
          where: {
            id: req.query.id,
            user_type : 1
          }
        });
        //console.log(users); return false;
        res.render('users/edituser', { response: users, title: 'users' })
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  new_delete_row: async function (req, res) {
    var model = req.body.model;
    var id = req.body.id;
    //console.log(id);
    var table_model = db.model;
    // return;
    try {
      //console.log(model);
      // return ;
      if (req.session.auth && req.session.auth == true) {
        await db[model].update({
          is_deleted : 1 }, {
          where: {
            id: id
          }
        });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
    res.json(1);
  },
  deleterows: async function (req, res) {
    var model = req.body.model;
    var id = req.body.id;
    //console.log(model); return;
    var table_model = db.model;
    // return;
    try {
      //console.log(model);
      // return ;
      if (req.session.auth && req.session.auth == true) {
        await db[model].destroy({
          where: {
            id: id
          }
        });
        if(model == 'venues') {
          await Terminals.destroy({
            where: {
              venue_id: id
            }
          });
        }
        
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
    res.json(1);
  },

  update_user: async function (req, res) {
    //console.log(req.body.id);return false;
    
    const data = req.body;
    const files = req.files;
    data.files = files;
    try {
      if (req.session.auth && req.session.auth == true) {
        const user = await vanue.findOne({
          where: {
            id: req.body.id,
            user_type : 1
          }
        });
        let old_password = user.dataValues.password;
        if(data.password && data.password != '') {
          var crypt = password(data.password);
          old_password = crypt;
        }
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

        let dob = user.dataValues.dob;
        if (req.body.dob && (req.body.dob != '' || req.body.dob != 'null' || req.body.dob != 'undefind')) {
          dob = req.body.dob;
        }
        const save = await vanue.update(
          {
            name: data.name,
           // email: req.body.email,
            password: old_password,
            dob: dob,
            image: old_image
          },
          { where: { id: req.body.id } }

        );
        //console.log(save);return false;
        req.flash('msg', "user updated successfully")
        res.redirect('/users_list');
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },

  update_status: async (req, res) => {
    try {

      let up_status = (req.body.status == 1) ? 0 : 1;

      const results = await vanue.update(
        {
          status: up_status,
        },
        { where: { id: req.body.id } }
      );
      if (results == 1) {
        return res.json({
          done: '1',
          status: up_status
        });
      } else {
        return res.json({
          done: '0',
        });
      }
    } catch (err) {
      throw err;
    }
  },

  /* reset_password_user: async (req, res) => {
    try {
      if (req.body.id != '') {
        let get_user_detail = await Users.findAll({
          where: { id: req.body.id },
        });
        console.log(get_user_detail); return false;
      }
    } catch (err) {
      throw err;
    }
  } */

  check_email: async function (req, res) {
    try {
      const emails = await vanue.findOne({
        attributes :['email'],
        where: {
          email: req.body.email
        }
      });
      //console.log(emails);return false;
      if (emails) {
        res.json('1');
      } else {
        res.json('0');
      }


    } catch (e) {
      console.log(e);
    }
  },
}
