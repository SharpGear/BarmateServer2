const model = require('../models');
let Sequelize = require('sequelize');
// var sequelize = new Sequelize('barmate', 'dbuser', 'cqlsys123');
let Op = Sequelize.Op;
const dateTime = require('node-datetime');

const orders = model.orders;
const users = model.users;
const vanue = model.venues;
const orderDetails = model.orderDetails;
const products = model.products;
const orderRounds = model.orderRounds;
const terminals = model.terminals;
const orderedProducts = model.orderedProducts;
const Brand = model.brands;
const Subcat = model.subcategories;
//orders.belongsTo(users, { foreignKey: 'user_id' });
orders.belongsTo(vanue, { foreignKey: 'venue_id' });
orders.belongsTo(vanue, { foreignKey: 'user_id', as: 'userDetail' });
terminals.belongsTo(vanue, { foreignKey: 'venue_id' });

//orders.belongsTo(vanue, { foreignKey: 'user_id' });
//orders.belongsTo(vanue, { foreignKey: 'venue_id' , as : 'venueDetail' });
orders.belongsTo(terminals, { foreignKey: 'terminal_id' });

orderDetails.belongsTo(vanue, { foreignKey: 'venue_id' });
orderDetails.belongsTo(vanue, { foreignKey: 'user_id', as: 'userDetail' });
orderDetails.belongsTo(terminals, { foreignKey: 'terminal_id' });
orderDetails.belongsTo(products, { foreignKey: 'product_id' });
orderDetails.belongsTo(orders, { foreignKey: 'order_id' });
products.belongsTo(Brand, { foreignKey: 'brand_id' });
products.belongsTo(Subcat, { foreignKey: 'subcategory_id' })
const helper = require('../helper/')
module.exports = {
  order_list: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        var results;
        if (req.query.start && req.query.end) {
          var conditions = {};
          // start timestamp
          var start_date = req.query.start;
          start_date = start_date.split("-");
          var new_start_date = start_date[1] + "/" + start_date[2] + "/" + start_date[0];
          var new_start_timestamp = new Date(new_start_date).getTime() / 1000.0;

          // end timestamp
          var end_date = req.query.end;
          end_date = end_date.split("-");
          var new_end_date = end_date[1] + "/" + end_date[2] + "/" + end_date[0];
          var new_end_timestamp = new Date(new_end_date).getTime() / 1000.0;

          new_end_timestamp = parseInt(86400) + parseInt(new_end_timestamp);


          conditions.createdAt = {
            $lte: new_end_timestamp,
            $gte: new_start_timestamp,
          };

          var results = await orders.findAll({
            order: [
              ['id', 'DESC']
            ],
            include: [{
              model: vanue,
              attributes: [
                'name'
              ]
            },
            {
              model: vanue,
              as: 'userDetail',
              attributes: [
                'name'
              ]
            },
            {
              model: terminals,
              attributes: [
                'name'
              ]
            },
            ],
            where: conditions
          });
        } else {
          var results = await orders.findAll({
            order: [
              ['id', 'DESC']
            ],
            include: [{
              model: vanue,
              attributes: [
                'name'
              ]
            },
            {
              model: vanue,
              as: 'userDetail',
              attributes: [
                'name'
              ]
            },
            {
              model: terminals,
              attributes: [
                'name'
              ]
            },
            ],
          });
          //console.log(results); return;
        }
        res.render('order/list', { response: results, date: dateTime, msg: req.flash('msg'), title: 'order' });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  view_order: async (req, res) => {
    //console.log(req.query); return;
    try {
      if (req.session.auth && req.session.auth == true) {
        const results = await orderDetails.findAll({
          include: [{
            model: vanue,
            attributes: [
              'name', 'image'
            ]
          },
          {
            model: vanue,
            as: 'userDetail',
            attributes: [
              'name', 'email', 'address'
            ]
          },
          {
            model: terminals,
            attributes: [
              'name'
            ]
          },
          {
            model: products,
            attributes: [
              'name', 'quantity', 'unit'
            ]
          },
          {
            model: orders,
            attributes: [
              'status', 'tbm_service', 'total', 'createdAt'
            ]
          },
          ],
          where: {
            order_id: req.query.id
          }
        });
        //console.log(results[0].dataValues.product); return;
        res.render('order/new_order_view', { response: results, date: dateTime, msg: req.flash('msg'), title: 'order' });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (err) {
      throw err;
    }
  },
  venue_product_purchase_history: async (req, res) => {
    try {

      const results = await orderDetails.findAll({
        include: [{
          model: vanue,
          attributes: [
            'name', 'image'
          ]
        },
        {
          model: vanue,
          as: 'userDetail',
          attributes: [
            'name'
          ]
        },
        {
          model: terminals,
          attributes: [
            'name', 'id'
          ]
        },
        {
          model: products,
          attributes: [
            'id', 'name',
          ]
        },
          // {
          //     model: orders,
          //     attributes: [
          //         'status', 'tbm_service', 'total', 'createdAt'
          //     ]
          // },
        ],
        group: ['terminal_id'],
        where: {
          venue_id: req.query.venue_id,
          product_id: req.query.product_id,

        }
      });
      let finalArray = []
      await Promise.all(results.map(async result => {
        // console.log("------------",result.dataValues.terminal_id);
        const user = await orderDetails.findAll({
          distinct: true,
          attributes: ['user_id', 'userDetail.gender'],
          where: {
            terminal_id: result.dataValues.terminal_id,
            venue_id: result.dataValues.venue_id,
            product_id: result.dataValues.product_id
          },
          include: [{
            model: vanue,
            as: 'userDetail',
            attributes: [],
          }],
          raw: true,
          // group: ['user_id'],

        });
        // console.log("user---",user);
        const objs = user;
        const gender = [['male', 1], ['female', 2]];

        const res = gender.reduce((acc, v) => {
          const obj = {};
          obj[v[0]] = objs.filter(x => x.gender == v[1]).length;
          return acc.concat(obj);
        }, []);
        result.dataValues.users_gender = res;

        finalArray.push(result);
      }));

      //   console.log(JSON.stringify(finalArray));
      //   return false;

      res.render('order/venue_product_purchase_history', {
        title: 'order',
        response: finalArray
      })

    }
    catch (err) {
      throw err;
    }
  },

  terminalProductPurchaseHistory: async (req, res) => {
    try {
      let product_id = req.query.product_id;
      let terminal_id = req.query.terminal_id;


      const results = await orderDetails.findAll({
        include: [{
          model: vanue,
          attributes: [
            'name', 'image'
          ]
        },
        {
          model: vanue,
          as: 'userDetail',
          attributes: [
            'id', 'gender', 'dob', 'post_code']
        },
        {
          model: terminals,
          attributes: [
            'name'
          ],
          where: {
            id: terminal_id
          }
        },
        {
          model: products,
          where: {
            brand_id: req.query.brand_id,
            id: product_id
          },
          include: {
            model: Subcat
          }
        }
        ],

        where: {
          where: Sequelize.where(model.Sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`timestamp`), '%D %b %Y'))"), '=', req.query.date),

        }
      });

      const terminal = await terminals.findOne({
        where: {
          id: terminal_id
        },
        attributes: ['name']
      });

      const product = await products.findOne({
        where: {
          id: product_id
        },
        attributes: ['name', 'quantity']
      });

      const brand = await Brand.findOne({
        where: {
          id: req.query.brand_id
        },
        attributes: ['name']
      });


      var maleCustomers = [];
      var femaleCustomers = [];
      results.forEach(async (result) => {
        if (result.userDetail.gender == 1) {
          age = Math.abs(new Date(Date.now() - new Date(result.userDetail.dob).getTime()).getUTCFullYear() - 1970);
          date = new Date(result.timestamp * 1000);
          let hours = date.getHours();
          let minutes = "0" + date.getMinutes();
          let seconds = "0" + date.getSeconds();
          // Will display time in 10:30:23 format
          let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
          maleObj = {
            dob: age,
            post_code: result.userDetail.post_code,
            date: formattedTime
          };
          maleCustomers.push(maleObj);
        }

        if (result.userDetail.gender == 2) {
          age = Math.abs(new Date(Date.now() - new Date(result.userDetail.dob).getTime()).getUTCFullYear() - 1970);
          date = new Date(result.timestamp * 1000);
          let hours = date.getHours();
          let minutes = "0" + date.getMinutes();
          let seconds = "0" + date.getSeconds();
          // Will display time in 10:30:23 format
          let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
          femaleObj = {
            dob: age,
            post_code: result.userDetail.post_code,
            date: formattedTime
          };
          femaleCustomers.push(femaleObj);
        }
        // else{
        //     femaleobj = { 
        //         dob: "",
        //         post_code: "" 
        //     };
        // }
        // if(result.userDetail.gender == 2){
        //     femaleObj = { 
        //         dob: result.userDetail.dob ,
        //         post_code: result.userDetail.post_code 
        //     };

        //     femaleCustomers.push(femaleObj);

        // }



      });

      let data = { subCategory: results[0].product.subcategory, venueName: results[0].venue.name, brand: brand.name, date: req.query.date, terminalName: terminal['name'], product: product, maleCustomers: maleCustomers, femaleCustomers: femaleCustomers };

      res.send(data);

    }
    catch (err) {
      res.send(err);
    }

  },

  sales_venues: async (req, res) => {
    try {
      venues = await orderDetails.findAll({
        attributes: ['id', 'venue_id', 'terminal_id'],
        include: [
          {
            model: vanue,
            required:true
          },
          {
            model: terminals,
            required:true
          }
        ],
        group: ['terminal_id']
      });

      res.render('sales_data/list', { venues: venues, title: 'sales_data' });

    }
    catch (err) {
      res.send(err);
    }

  },
  getTerminalOrdersBydate: async (req, res) => {
    try {
      /*  console.log("function innnnnnnnnnnnnnnn") */
      orderDetails.findAll({
        attributes: ['id', 'timestamp', [model.Sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`timestamp`), '%D %b %Y'))"), 'date']],

        group: ['date'],
        order: [
          ['timestamp', 'DESC']
        ],
        where: {
          venue_id: req.query.venue_id,
          terminal_id: req.query.terminal_id,
        }
      }).then(async (orders) => {

        let terminal = await terminals.findOne({
          attributes: ['id', 'name'],
          include: [{ model: vanue }],
          where: {
            id: req.query.terminal_id
          }
        })



        res.render('sales_data/order_dates', { orders: orders, terminal: terminal, title: 'sales_data' });

      })

    }
    catch (err) {
      res.send(err);
    }
  },
  getOrdersBrandsBydate: async (req, res) => {
    try {


      orderDetails.findAll({
        attributes: ['id', 'timestamp'],
        include: [{
          model: products,
          include: {
            model: Brand,
          },
          // where:{
          //     brand_id : {
          //         $ne : 0
          //     }
          // }
        }],
        // group:['brand_id'],           
        // group: [sequelize.col(Brand.id)],
        group: ['product.brand_id'],

        where: {
          where: Sequelize.where(
            model.Sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`timestamp`), '%D %b %Y'))"), '=', req.query.date),
          venue_id: req.query.venue_id,
          terminal_id: req.query.terminal_id,

        },
        // group: [sequelize.col(product.id)],


      }).then(async (orders) => {
        // console.log('===============',orders[0].product)
        let terminal = await terminals.findOne({
          attributes: ['id', 'name'],
          include: [{ model: vanue }],
          where: {
            id: req.query.terminal_id,

          }
        })

        //  console.log(orders,"orders==========");return;

        res.render('sales_data/order_brands', { dateString: req.query.date, orders: orders, terminal: terminal, title: 'sales_data' });

      })

    }
    catch (err) {
      res.send(err);
    }
  },

  productSalesDataByBrand: async (req, res) => {
    try {

      // console.log("inn func");
      //        console.log(req.query.brand,"req.query.brand")
      const results = await orderDetails.findAll({
        attributes: ['id', 'timestamp', 'user_id', 'terminal_id', 'venue_id', 'product_id'],
        include: [{
          model: products,
          include: [{
            model: Brand,
          }, {
            model: Subcat,
          }],
          where: {
            brand_id: req.query.brand
          }
        },
        {
          model: vanue,
          as: 'userDetail',
          attributes: [
            'name'
          ]
        },
        {
          model: terminals,
          attributes: [
            'name', 'id'
          ],
          where: {
            id: req.query.terminal_id
          }
        },
        {
          model: vanue,
          attributes: [
            'name', 'image'
          ]
        },
        ],
        group: ['product_id'],
        where: {
          where: Sequelize.where(model.Sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`timestamp`), '%D %b %Y'))"), '=', req.query.date),
          venue_id: req.query.venue_id

        }
      });


      // console.log(results);
      //  return false;   
      let finalArray = []
      await Promise.all(results.map(async result => {
        // console.log("------------",result.dataValues.terminal_id);
        const user = await orderDetails.findAll({
          distinct: true,
          attributes: ['user_id', 'userDetail.gender'],
          where: {
            terminal_id: result.dataValues.terminal_id,
            venue_id: result.dataValues.venue_id,
            timestamp: result.dataValues.timestamp,
            product_id: result.dataValues.product_id
          },
          include: [{
            model: vanue,
            as: 'userDetail',
            attributes: [],
          }],
          raw: true,
          // group: ['user_id'],

        });
        console.log("user---", user);
        const objs = user;
        const gender = [['male', 1], ['female', 2]];

        const res = gender.reduce((acc, v) => {
          const obj = {};
          obj[v[0]] = objs.filter(x => x.gender == v[1]).length;
          return acc.concat(obj);
        }, []);
        result.dataValues.users_gender = res;

        finalArray.push(result);
      }));

      //   console.log(JSON.stringify(finalArray));
      //   return false;


      res.render('sales_data/product_sales_by_brand', {
        title: 'sales_data',
        response: finalArray,
        dateString: req.query.date
      })

    }
    catch (err) {
      throw err;
    }
  },
}