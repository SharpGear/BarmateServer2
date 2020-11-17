const model = require('../models')
const MainCategory = model.mainCategory;
const pro = model.admin_products;
const appProduct = model.products;
const cate = model.categories;
const db = model.subcategories;
const venue = model.venues;
const Brand = model.brands;
const helper = require('../helper/');
const fileupload = helper.file_upload;
pro.belongsTo(MainCategory, { foreignKey: 'main_category_id' });
pro.belongsTo(cate, { foreignKey: 'category_id' });
pro.belongsTo(db, { foreignKey: 'subcategory_id' });
pro.belongsTo(Brand, { foreignKey: 'brand_id' });
const constant = require('../config/constant');

//pro.belongsTo(venue, { foreignKey: 'venue_id' });
module.exports = {
  products_list: async function (req, res) {
    try {
      // const users = await pro.findAll();
      if (req.session.auth && req.session.auth == true) {
        const users = await pro.findAll({
          order: [['id', 'DESC']],
          include: [
            {
              model: cate,
              attributes: [
                'name'
              ]
            },
            {
              model: Brand,
              attributes: [
                'name'
              ]
            },
            {
              model: db,
              attributes: [
                'name'
              ]
            },
           /*  {
              model: venue,
              attributes: [
                'name'
              ]
            }, */
            {
              model: MainCategory,
              attributes: [
                'title'
              ]
            },
          ],

          

        });

        res.render('product/list', { response: users, msg: req.flash('msg'), title: 'product' });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  products: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const results = await cate.findAll();
        const brands =await Brand.findAll();
        //console.log(results); return;
        if (results != '') {
          const data = await db.findAll({
            where : {
              is_deleted : 0
            }
          }); // for sub category
          let main_cat = await MainCategory.findAll();
          res.render('product/addproduct', { response: results, brands:brands, drop: data,   main_cat_data: main_cat , title: "product" })


        } else {
          res.render('product/addproduct', { response: results,brands:brands ,drop: '',   main_cat_data: '',   title: "product" })
        }
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },

  add_product: async function (req, res) {
   // console.log(req.body); return;
    const data = constant.image_url + fileupload(req.files.image);
    //console.log(data); return;

    try {
      if (req.session.auth && req.session.auth == true) {
       /*  let p_name = await db.findAll({
          where: { id: req.body.venueId }
        });
        if (p_name != '') {
          p_name = p_name[0].dataValues.name;

        } else {
          p_name = '';
        } */
        // console.log(); return false;
        // const data = imageupload(req.files.image)
        let quant = req.body.quantity+' '+req.body.unit ;
        const brand = await Brand.findOne({
          where:{
            id:req.body.brand_id
          },
          attributes:['name']
        });
        const results = await pro.create({
          //venue_id: 0,
          main_category_id: req.body.main_category,
          categoryId: req.body.category,
          subcategoryId: req.body.sub_category,
          name: req.body.name,
          brand_id: req.body.brand_id,
          price: req.body.price,
          description: req.body.description,
          quantity: quant,
          unit: req.body.unit,
          image: data
        });
        req.flash('msg', "product added successfully")
        res.redirect('/product_view');
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },

  edit_product: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const results = await pro.findAll({
          where: {
            id: req.query.id,
          },
          include:[{
            model: MainCategory,
            attributes: [
              'title'
            ],
            include:{
              model:cate,
              attributes:['id','name'],
              // include:{
              //   model:db
              // }
            }
          },
        {
          model:db
        }]
        });
        let productSubcategories = await db.findAll({
          where:{
            category_id:results[0].categoryId,
            is_deleted:0
          }
        })
        results[0].productSubcategories = productSubcategories;
        const brands =await Brand.findAll();
        if (results != '') {
          let quanty = results[0].dataValues.quantity.toString();
          let quantity =  quanty.split(" ");
         // console.log(quantity[0]); return false;
          results[0].dataValues.quantity = quantity[0] ;
          const drop = await cate.findAll();
          if (drop != '') {
            const data = await db.findAll({
              where : {
                is_deleted : 0
              }
            });
            let main_catt = await MainCategory.findAll();
            res.render('product/editproduct', { response: results, brands:brands ,cat: drop, sub_cat: data, main_cat: main_catt, title: "product" ,msg: req.flash('msg')})

          } else {
            res.render('product/editproduct', { response: results,brands:brands ,cat: '', sub_cat: '', main_cat: '', title: "product",msg: req.flash('msg') })
          }
        } else {
          res.render('product/editproduct', { response: '', brands:brands ,cat: '', sub_cat: '', main_cat: '', title: "product" ,msg: req.flash('msg')})
        }
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  update_product: async function (req, res) {
    //console.log(req.files); return;
    const data = req.body;
    const files = req.files;
    data.files = files;
    //console.log(data.files);return;
    try {
      if (req.session.auth && req.session.auth == true) {
        const user = await pro.findOne({
          where: {
            id: data.id
          }
        });
        let old_image = user.dataValues.image;
        let image_url = '';
        //console.log(data.files.image);return false;
        if (data.files.image != '' && data.files.image) {

          //let image = data.files.image;
          image_url = data.files.image.name;
          data.files.image.mv(process.cwd() + '/public/images/' + data.files.image.name, function (err) {
            if (err)
              return res.status(500).send(err);
            //res.send('File uploaded!');
          });
          old_image = constant.image_url + image_url;
          await appProduct.update({
            image:old_image,
            
          },{
            where:{
              admin_product_id:user.dataValues.id
            }
          })
        }
        await appProduct.update({
          name:data.name,
          brand_id: data.brand_id,
          categoryId: data.category_id,
          subcategoryId: data.sub_category,
        },{
          where:{
            admin_product_id:user.dataValues.id
          }
        })
        let quant = req.body.quantity+' '+req.body.unit ;
        const brand = await Brand.findOne({
          where:{
            id:data.brand_id
          },
          attributes:['name']
        });
        const results = await pro.update({
          main_category_id: data.main_category,
          categoryId: data.category_id,
          subcategoryId: data.sub_category,
          name: data.name,
          brand_id: data.brand_id,
          price: data.price,
          description: data.description,
          quantity: quant,
          unit: data.unit,
          image: old_image
        }, 
          
          {
          where: { id: data.id }
        })
        req.flash('msg', "product updated successfully")
        res.redirect('back')
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  /*  app.post('/update_row_status', async function(req,res){
            console.log(req.body);
          var id=req.body.id;
          var model=req.body.model;
            try {
              let check_email_exist=   await db[model].update({status :  req.body.status},
                                     {
                                       where :
                                       { id : id }
                                     });
              if((check_email_exist)){

                res.json(true);
              }else{
                res.json(false);
              }
              return;
            } catch (e) {
              console.log(e);
            }
          }); */

  get_categorys: async (req, res) => {
    try {
      //console.log(req.body);return;
      const results = await cate.findAll({
        where: { main_category_id: req.body.id },
        attributes: [
          'id', 'name'
        ]
      });
     // console.log(results); return;
      return res.json(results);
    } catch (err) {
      throw err;
    }
  },
  get_subcategory: async (req, res) => {
    try {
      //console.log(req.body);return;
      const results = await db.findAll({
        where: { category_id: req.body.id ,main_category_id: req.body.main_cat,is_deleted:0},
        attributes: [
          'id', 'name'
        ]
      });
     // console.log(results); return;
      return res.json(results);
    } catch (err) {
      throw err;
    }
  },

 

}