const paypal = require('paypal-rest-sdk');
const braintree = require('braintree');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AWMITMtNPtnXW4yNZMyi_pvFH2bzC5qwZZagOg2zk1-YlIzLqOWqJyT1_u80mKMS4hVR6W5q649hG0S7',
  'client_secret': 'EE9_VwxO8DaZ1hASXM4Dap-_CZVY-tu379AjfwMCRIVNmEAlp_kt0LgAX5f3GgcmHMeSoGjB2YEVdyQJ'
});
var gateway = braintree.connect({
  environment:  braintree.Environment.Sandbox,
  merchantId:   'nmfdvfkm7s8f53wx',
  publicKey:    '5h9xbgrc29nfcv6j',
  privateKey:   '80751107efc30d8096d4b569f14f5a53'
});

var request = require('request');
// Add your credentials:
// Add your client ID and secret
var CLIENT =
  'AWMITMtNPtnXW4yNZMyi_pvFH2bzC5qwZZagOg2zk1-YlIzLqOWqJyT1_u80mKMS4hVR6W5q649hG0S7';
var SECRET =
  'EE9_VwxO8DaZ1hASXM4Dap-_CZVY-tu379AjfwMCRIVNmEAlp_kt0LgAX5f3GgcmHMeSoGjB2YEVdyQJ';
var PAYPAL_API = 'https://api.sandbox.paypal.com';

// const stripe = require('stripe')('sk_test_pciIAynild7VofmBr89ZTX6T');

const stripe = require('stripe')('sk_live_vKiafQpCORh0pqxesx9pIdJj00uL4I71MW'); // CLIENT
// const stripe = require('stripe')('sk_test_4gPeyEDuYwnlWjzbrV6YHcT000EIGH5XiM'); // CLIENT

   
gateway.clientToken.generate({
  // customerId: aCustomerId
}, function (err, response) {
  var clientToken = response.clientToken
});

const database = require('../db/db');
const cron = require('node-cron');
const atob = require('atob');
const btoa = require('btoa');
var ejs = require("ejs");
const dateTime = require('node-datetime');
const db = require('../models');
const helper = require('../helper/index');
const apihelper = require('../helper/apihelper.js');
const constant = require('../config/constant');
const responseHelper = require('../helper/responseHelper');
const helpers = new apihelper();
const receiptFunction = require('./vanues_controller');
var moment = require('moment');
const Users = db.users;
const Admin = db.admins;
const Suspend = db.Suspend;
const VenueSearchKeyword = db.venue_search_keywords;
const Report = db.report; //report To App
const Review = db.review; //review To App
const Card = db.Cards;
const WebhookData = db.WebhookData;
const Terminal = db.terminals;
const MainCategory = db.mainCategory;
const Categories = db.categories;
const Venu = db.venues; // user_type = 0
const User = db.venues; // user_type = 1
const Transactions = db.transactions;
const password = helper.crypt;
const Subcat = db.subcategories;
const Favourite = db.favourites;
const Content = db.contents;
const Product = db.products;
const Admin_Products = db.admin_products;
const Order = db.orders;
const OrderDetail = db.orderDetails;
const VenuCat = db.venue_categories;
const Brand = db.brands;
const Ads = db.advertisements; // advertisement model 
const TerminalAds = db.terminal_advertisements;
const VenueReviews = db.venue_reviews;
MainCategory.hasMany(Categories, { foreignKey: 'main_category_id' })
// MainCategory.hasMany(Subcat, {foreignKey: 'main_category_id'})
Subcat.belongsTo(MainCategory, { foreignKey: 'main_category_id' })
Categories.hasMany(Subcat, { foreignKey: 'category_id' })

Order.belongsTo(Venu, { foreignKey: 'venue_id' });
Order.belongsTo(Terminal, { foreignKey: 'terminal_id' });
Order.belongsTo(User, { as: 'userDetails', foreignKey: 'user_id' });
Order.belongsTo(Subcat, { foreignKey: 'sub_category_id' });

OrderDetail.belongsTo(Product, { foreignKey: 'product_id' });
OrderDetail.belongsTo(Categories, { foreignKey: 'category_id' });
OrderDetail.belongsTo(Subcat, { foreignKey: 'sub_category_id' });

Order.hasMany(OrderDetail, { foreignKey: 'order_id' })

Venu.belongsTo(Product, { foreignKey: 'id' })
Product.hasMany(MainCategory, { foreignKey: 'id' })
Product.belongsTo(Subcat, { foreignKey: 'subcategory_id', as: 'sub_category' })
Product.belongsTo(Brand, { foreignKey: 'brand_id' });
Categories.belongsTo(Product, { foreignKey: 'id' })
Subcat.belongsTo(Product, { foreignKey: 'id' })

Admin_Products.belongsTo(MainCategory, { foreignKey: 'main_category_id' });
Admin_Products.belongsTo(Categories, { foreignKey: 'category_id' });
Admin_Products.belongsTo(Subcat, { foreignKey: 'subcategory_id', as: 'sub_cat' });
Admin_Products.belongsTo(Brand, { foreignKey: 'brand_id' });
VenueSearchKeyword.belongsTo(Venu, { foreignKey: 'venue_id' });
Favourite.belongsTo(Venu, { foreignKey: 'venue_id' });
Order.belongsTo(MainCategory, { foreignKey: 'main_category_id' });

let Sequelize = require('sequelize');
let Op = Sequelize.Op;
const fileupload = helper.file_upload;
var jwt = require('jsonwebtoken');
const jwtToken = 'secret';

const VenueIntegrationModel = db.venue_integration;
const KountaManager = require('../classes/KountaManager');
const SwiftManager = require('../classes/SwiftManager');
const axios = require('axios');

// crone to split money to venues
// cron.schedule('*/59 * * * *', async(req, res) => {
//     console.log('cron is working');

//     const txns = await Transactions.findAll({
//         where: {
//             payout: 0
//         }
//     });

//     if (txns.length > 0) {
//         await Promise.all(txns.map(async c => {
//             const venue = await Venu.findOne({
//                 attributes: ['id', 'paypal_id', 'device_type', 'device_token'],
//                 where: {
//                     id: c.dataValues.venue_id
//                 }
//             })

//             c.dataValues.venue_paypal_id = venue;
//             //console.log(c);return;
//             //console.log(c.dataValues.venue_paypal_id.dataValues.paypal_id); return;
//             let sender_batch_id = Math.random().toString(36).substring(9);
//             const splited_amount = (c.dataValues.amount - 0.30) * 5 / 100;
//             // console.log(splited_amount); return ;
//             const num = c.dataValues.amount - splited_amount;
//             total_amount = num;
//             // total_amount = num.toFixed(2);
//             // console.log(total_amount); return ;
//             // console.log(sender_batch_id); return ;

//             let create_payout_json = {
//                 "sender_batch_header": {
//                     "sender_batch_id": sender_batch_id,
//                     "email_subject": "You have a payment"
//                 },
//                 "items": [{
//                     "recipient_type": "EMAIL",
//                     "amount": {
//                         "value": total_amount,
//                         "currency": "AUD"
//                     },
//                     "receiver": c.dataValues.venue_paypal_id.dataValues.paypal_id,
//                     "note": "Thank you.",
//                     "sender_item_id": "item_3"
//                 }]
//             };

//             await paypal.payout.create(create_payout_json, async function(error, payout) {
//                 if (error) {
//                     console.log(error.response);
//                     throw error;
//                 } else {
//                     console.log("Create Single Payout Response");
//                     console.log(payout);
//                     if (payout) {
//                         const transaction = await Transactions.update({
//                             payout: 1
//                         }, {
//                             where: {
//                                 id: c.dataValues.id
//                             }
//                         });

//                         const message = {
//                             to: c.dataValues.venue_paypal_id.dataValues.device_token,
//                             collapse_key: '1',
//                             notification: {
//                                 title: 'You have received a payment',
//                                 body: 'You have received a payment of AUD ' + total_amount + ' ',
//                             },
//                             data: {
//                                 notification_type: 2
//                             },
//                         };
//                         helpers.push_notification(message);
//                     }
//                     return;
//                 }
//             });


//             /* loops ends */
//         }));
//     }
// });

// function to get data of today trade hito send email receipt  

//Cal


var receipt_for_venue_order_history = async (requestdata) => {
  try {
    ///// for all terminals
    var conditons = {};
    conditons.venue_id = requestdata.venue_id;
    conditons.main_category_id = requestdata.main_category_id;
    conditons.conclude_status = 1; // concluded
    conditons.status = {
      $in: [2, 3, 4]
    };
    /*  conditons.createdAt = {
         $lte: to_time,
         $gte: t_t
     }; */
    var get_Ordersids = await Order.findAll({
      attributes: ['id'],
      where: conditons
    });
    if (get_Ordersids) {
      var order_ids = [];
      for (var order of get_Ordersids) {
        order_ids.push(order.dataValues.id);
      }
      conditons = {};
      conditons.order_id = { $in: order_ids };
    }
    var total = await OrderDetail.findAll({
      attributes: [
        [db.sequelize.fn('sum', db.sequelize.col('quantity')), 'total_product'],
        [db.sequelize.literal("(sum(`orderDetails`.`quantity`*`orderDetails`.`price` ))"), 'total_amount']
      ],
      where: conditons
    });
    var categoies = await OrderDetail.findAll({
      attributes: ['sub_category_id', 'category_id', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
      include: [{
        model: Subcat,
        attributes: ['name']
      },
      {
        model: Categories,
        attributes: ['name', 'image']
      }
      ],
      where: conditons,
      /*  group: [db.sequelize.col('`category`.`name`'),db.sequelize.col('`subcategory`.`name`')],  */
      group: ['category_id', 'sub_category_id'],
    });
    var full_final = {};
    if (categoies && categoies.length > 0) {
      var final = [];
      full_final.total = total;
      for (var value of categoies) {
        // console.log(value);
        conditons.sub_category_id = value.dataValues.sub_category_id;
        // conditons.category_id=value.dataValues.category_id;
        var products = await OrderDetail.findAll({
          attributes: ['product_id', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
          // order : [['id']],
          group: ['product_id'],
          include: [{
            model: Product,
            attributes: ['name', 'description', 'quantity'],
          }],
          where: conditons,
          order: [
            [Product, 'name', 'ASC'],
            [Product, 'quantity', 'ASC'],
          ],
        });
        // value.dataValues.cat_name=value.dataValues.category.name;
        value.dataValues.Product = products;
        final.push(value);
      }
      full_final.data = final;
      full_final.orders_id = get_Ordersids;
    }
    return full_final;
  } catch (err) {
    throw err;
  }
}// function to make receipt for customer order detail
var receipt_of_customer_order_detail = async (requestdata) => {
  try {

    if (requestdata != "") {
      if (requestdata.type == 1) { // for today customers
        //var conditons = {};
        let conditons = {};
        conditons.venue_id = requestdata.venue_id;
        // conditons.id=requestdata.order_id;
        conditons.user_id = requestdata.user_id;
        //conditons.main_category_id = requestdata.main_category_id;
        conditons.conclude_status = 0
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = parseInt(requestdata.date_timestamp);
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }
        let Orders = await Order.findAll({
          include: [{
            model: OrderDetail,
            attributes: ['quantity', 'price', 'instructions', 'size', 'product_name'],
            include: {
              model: Product,
              attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],

            }
          },],
          where: conditons,
          order: [
            ['id', 'ASC'],
            [db.sequelize.col('`orderDetails->product`.`name`'), 'ASC'],

          ],
        });
        /* delete conditons.createdAt;
        conditons.timestamp = {
            $lte: to_time,
            $gte: t_t
        }; */
        let final = {};
        if (Orders) {
          final.rounds = Orders;
          //var order_ids = [];
          let order_ids = [];
          for ( /* var order of Orders */ let order of Orders) {
            let check = await Suspend.count({
              where: {
                user_id: requestdata.user_id,
                venue_id: requestdata.venue_id,
                status: 1
              }
            });
            if (check) {
              order.dataValues.suspend = 1;
            } else {
              order.dataValues.suspend = 0;
            }
            order_ids.push(order.dataValues.id);
          }
          let quantities = await OrderDetail.findAll({
            attributes: ['size', 'product_name', 'price',
              [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total'],
              [db.sequelize.literal(" (sum(`orderDetails`.`price` * `orderDetails`.`quantity`))"), 'total_price']

            ],
            include: [{
              model: Product,
              attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
            }],
            group: ['product_id'],
            where: {
              order_id: {
                $in: order_ids
              }
            },
          });
          final.quantities = quantities;
          const get_Venue = await Venu.findOne({
            attributes: ['id', 'name', 'email', 'image', 'avg_rating', 'phone', 'fax', 'abn'],
            where: {
              id: requestdata.venue_id
            }
          });
          // receipt 
          if (get_Venue) {
            get_Venue.dataValues.receipt_no = parseInt(requestdata.date_timestamp);
          }
          final.venueDetail = get_Venue ? get_Venue : {}
        }
        return final;
      } else { // for all customers
        //var conditons = {};
        let conditons = {};
        conditons.venue_id = requestdata.venue_id;
        // conditons.id=requestdata.order_id;
        conditons.user_id = requestdata.user_id;
        //conditons.main_category_id = requestdata.main_category_id;
        //conditons.conclude_status = 0
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = parseInt(requestdata.date_timestamp);
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }
        let Orders = await Order.findAll({
          include: [{
            model: OrderDetail,
            attributes: ['quantity', 'price', 'size', 'product_name'],
            include: {
              model: Product,
              attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
            }
          },],

          order: [
            ['id', 'ASC'],
            [db.sequelize.col('`orderDetails->product`.`name`'), 'ASC'],
          ],
          where: conditons,

        });
        /*  delete conditons.createdAt;
         conditons.timestamp = {
             $lte: to_time,
             $gte: t_t
         }; */
        let final = {};
        if (Orders) {
          final.rounds = Orders;
          // var order_ids = [];
          let order_ids = [];
          for ( /* var order of Orders */ let order of Orders) {
            let check = await Suspend.count({
              where: {
                user_id: requestdata.user_id,
                venue_id: requestdata.venue_id,
                status: 1
              }
            });
            if (check) {
              order.dataValues.suspend = 1;
            } else {
              order.dataValues.suspend = 0;
            }
            order_ids.push(order.dataValues.id);
          }
          let quantities = await OrderDetail.findAll({
            attributes: ['size', 'product_name', 'price',
              [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total'],
              [db.sequelize.literal(" (sum(`orderDetails`.`price` * `orderDetails`.`quantity`))"), 'total_rice']

            ],
            include: [{
              model: Product,
              attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
            }],
            group: ['product_id'],
            where: {
              order_id: {
                $in: order_ids
              }
            }
          });
          final.quantities = quantities;
          const get_Venue = await Venu.findOne({
            attributes: ['id', 'name', 'email', 'image', 'avg_rating', 'phone', 'fax', 'abn'],
            where: {
              id: requestdata.venue_id
            }
          });
          // receipt 
          if (get_Venue) {
            get_Venue.dataValues.receipt_no = parseInt(requestdata.date_timestamp);
          }
          final.venueDetail = get_Venue ? get_Venue : {}

        }
        return final;
      }
    }
  } catch (err) {
    return responseHelper.onError(res, err, err);
  }
}
module.exports = class UserApisController {
  constructor() { }

  async stripe_connect(req, res) {
    try {
    	var state = req.query.state;
    	var scope = req.query.scope;
    	var code = req.query.code;
    	var error = req.query.error;

    	if(error == undefined || error == "undefined") {
    		if(scope == "read_write") {
    			const response = await stripe.oauth.token({
				  	grant_type: 'authorization_code',
				  	code: code,
				});

				const stripe_user_id = response.stripe_user_id;

				let find_user = await Venu.findOne({
					where: {
						id: state
					}
				});

				var data = {};

				if(find_user) {
					if(find_user.has_account_id == 0) {
						let update_user = await Venu.update({
							account_id: stripe_user_id,
							has_account_id: 1
						}, {
							where: {
								id: state
							}
						});

						if(update_user) {
							data.msg = "has_account_id";
							data.reason = "success";
						} else {
							data.msg = "error";
							data.reason = "Account id not added";
						}
					} else {
						let update_user = await Venu.update({
              account_id: stripe_user_id,
              has_account_id: 1
            }, {
              where: {
                id: state
              }
            });

            if(update_user) {
              data.msg = "has_account_id";
              data.reason = "success";
            } else {
              data.msg = "error";
              data.reason = "Account id not added";
            }
					}
				} else {
					data.msg = "error";
					data.reason = "User not found";
				}
    		} else {
    			data.msg = "error";
    			data.reason = "Scope error";
    		}
    	} else {
    		data.msg = "error";
    		data.reason = error;
    	}

        return responseHelper.post(res, data);
    } catch (err) {
      // console.log(err);
      // throw err;
      return responseHelper.onError(res, err, err);

    }
  }

  async signup(req, res) {
    try {
      const required = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        user_type: req.body.user_type,
        security_key: req.headers.security_key,
        image: req.files,
        table_name: 'venues',


        checkexit: 1
      };


      const non_required = {
        latitude: req.body.latitude == undefined ? 0 : req.body.latitude,
        longitude: req.body.longitude == undefined ? 0 : req.body.longitude,
        address: req.body.address == undefined ? 0 : req.body.address,
        dob: req.body.dob == undefined ? 0 : req.body.dob,
        gender: req.body.gender == undefined ? 0 : req.body.gender, // 0=> not specified , 1=> male , 2=> female , 3=> LGBTQ
        paypal_id: req.body.paypal_id == undefined ? 0 : req.body.paypal_id,
        device_type: req.body.device_type == undefined ? 0 : req.body.device_type,
        device_token: req.body.device_token == undefined ? 0 : req.body.device_token,
        fax: req.body.fax == undefined ? 0 : req.body.fax,
        phone: req.body.phone == undefined ? 0 : req.body.phone,
        abn: req.body.abn == undefined ? 0 : req.body.abn,
        post_code: req.body.post_code == undefined ? 0 : req.body.post_code,
      };
      // console.log(required);
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        var file_name = helper.file_upload(req.files.image)
        requestdata.image = constant.image_url + file_name;

        let user_create = await Venu.create(requestdata);

        if (!user_create) {
          throw "Error while user data insertion";
        }

        const credentials = {
          id: user_create.dataValues.id,
          password: user_create.dataValues.password,
          email: user_create.dataValues.email
        };
        const token = jwt.sign(credentials, jwtToken, { algorithm: 'HS256' });

        requestdata.token = token;
        requestdata.id = user_create.dataValues.id;
        if (requestdata.user_type == 0) {
          const main_trmnl = await Terminal.create({
            venue_id: user_create.dataValues.id,
            name: 'Main',
            is_main: 1,
            status: 1,
            main_category: 3, // default  BOTH MAIN categories 

          });
          if (main_trmnl) {
            const ven_main_termnl = await Venu.update({
              terminal_id: main_trmnl.dataValues.id
            }, {
                where: {
                  id: user_create.dataValues.id,
                }
              }

            );
          }
          // default categories to venue
          const categories = await Categories.findAll({
            attributes: ['id', 'main_category_id']
          });

          if (categories) {
            await Promise.all(categories.map(async c => {

              const save2 = await VenuCat.create({
                venue_id: user_create.dataValues.id,
                category_id: c.dataValues.id,
                main_category_id: c.dataValues.main_category_id
              });
            }));
          }

        }

        let mail = {
          from: "admin@barmate.com",
          to: requestdata.email,
          subject: "Barmate Verification Link (" + new Date() + ")",
          html: 'Click here to verify your account <a href="' + "https://admin.thebarmate.com/" +
            "email_verification/" +
            user_create.dataValues.id +
            '"> Click</a>'
        };
        //console.log(mail);return false;

        let email = helpers.send_mail(mail);
        return responseHelper.post(res, requestdata);

      }
    } catch (err) {
      // throw err;

      return responseHelper.onError(res, err, err);
    }
  }
  async api_url_verification(req, res) {
    const data = req.params;
    //console.log('dataaaaaaaaaa', data);
    try {
      const chk_usr = await Venu.findOne({
        where: {
          id: data.id
        }
      });
      if (chk_usr) {
        await Venu.update({
          is_verified: '1'
        }, {
            where: {
              id: data.id
            }
          });
        res.send('Account verified , Please login in the app');
      } else {
        res.send("Link has been expired!");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async edit_profile(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,

        // password: req.body.password,
        user_type: req.body.user_type,
        // image: req.files,
        table_name: 'venues',


        checkexit: 1
      };
      const non_required = {
        paypal_id: req.body.paypal_id == undefined ? 0 : req.body.paypal_id,
        latitude: req.body.latitude == undefined ? 0 : req.body.latitude,
        longitude: req.body.longitude == undefined ? 0 : req.body.longitude,
        dob: req.body.dob == undefined ? '' : req.body.dob,
        address: req.body.address == undefined ? '' : req.body.address,
        fax: req.body.fax == undefined ? 0 : req.body.fax,
        phone: req.body.phone == undefined ? 0 : req.body.phone,
        abn: req.body.abn == undefined ? 0 : req.body.abn,
        post_code: req.body.post_code == undefined ? 0 : req.body.post_code,
        gender: req.body.gender == undefined ? 0 : req.body.gender,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        // console.log(requestdata);
        //   return;
        if (req.files && req.files.image) {
          var file_name = helper.file_upload(req.files.image)
          requestdata.image = constant.image_url + file_name;
        }


        let user_create = await Venu.update(requestdata, {
          where: {
            id: requestdata.id,
            user_type: requestdata.user_type


          }
        });

        if (!user_create) {
          throw "Error while update user data insertion";
        }


        var user_data = await Venu.findOne({
          where: {
            id: requestdata.id,
          }
        });


        return responseHelper.post(res, user_data.dataValues);

      }
    } catch (err) {
      // throw err;

      return responseHelper.onError(res, err, err);
    }
  }
  async add_bank_account(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // token: req.headers.token,
        id: req.body.id,
        bank_name: req.body.bank_name,
        bank_account_name: req.body.bank_account_name,
        // bank_location: req.body.bank_location,
        account_number: req.body.account_number,
        bsb: req.body.bsb,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
        paypal_id: req.body.paypal_id,
        table_name: 'venues',

        checkexit: 2
      };


      const non_required = {

      };
      // console.log(required);
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        const save = await Venu.update(requestdata,

          { where: { id: requestdata.id } },

        );


        return responseHelper.post(res, requestdata);

      }
    } catch (err) {
      // throw err;

      return responseHelper.onError(res, err, err);
    }
  }
  async add_paypal_Account(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // token: req.headers.token,
        id: req.body.id,
        paypal_id: req.body.paypal_id,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      // console.log(required);
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        const save = await Venu.update(requestdata, { where: { id: requestdata.id } });
        return responseHelper.post(res, requestdata);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async add_terminal(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // token: req.headers.token,
        venue_id: req.body.venue_id,
        name: req.body.name,
        email: req.body.email,
        type: req.body.type,

        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {
        password: req.body.password,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const check_mail = await Venu.findOne({
          attributes: ['email',],
          where: {
            email: requestdata.email
          }
        });
        if (check_mail) {
          throw "Email already taken, please select another"
        }
        if (requestdata.type == 0) {
          var pass = helper.crypt(requestdata.password)
          var new_password = pass;
        }
        /* console.log(new_password);
        return; */
        if (requestdata.type == 1) {
          var check_pass = await Venu.findOne({
            attributes: ['password',],
            where: {
              id: requestdata.venue_id
            }
          });
          new_password = check_pass.dataValues.password;
        }

        const save = await Terminal.create({
          venue_id: requestdata.venue_id,
          name: requestdata.name,
        });
        if (save) {
          const img = await Venu.findOne({
            attributes: ['name', 'image', 'phone', 'fax', 'abn'],
            where: {
              id: requestdata.venue_id,
            }
          });
          const ven = await Venu.create({
            name: requestdata.name,
            email: requestdata.email,
            password: new_password,
            image: img.dataValues.image,
            terminal_id: save.dataValues.id,
            is_verified: 1,
            user_type: 2,
            phone: img.dataValues.phone,
            fax: img.dataValues.fax,
            abn: img.dataValues.abn,
          })

        } else {
          throw "Error in terminal additon."
        }
        return responseHelper.post(res, requestdata);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async edit_terminal(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        venue_id: req.body.venue_id,
        name: req.body.name,
        email: req.body.email,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        password: req.body.password,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var user_data = await Terminal.findOne({
          where: {
            id: requestdata.id,
            venue_id: requestdata.venue_id,
          }
        });
        if (!user_data) {
          throw "Invalid id for updation."
        }

        if (requestdata.password && requestdata.password != "") {
          var pass = helper.crypt(requestdata.password)
          var new_password = pass;
        }

        const terminal_data_check = await Venu.findOne({
          attributes: ['id', 'terminal_id'],
          where: {
            terminal_id: requestdata.id,
            // user_type: 2
          }
        });
        if (terminal_data_check) {
          const email_check = await Venu.findOne({
            attributes: ['email', 'terminal_id'],
            where: {
              email: requestdata.email,
              terminal_id: {
                $ne: requestdata.id,
              }
            }
          });
          if (email_check) {
            throw "Email already taken , please select another"
          }

          const save = await Terminal.update({
            name: requestdata.name,
          }, {
              where: {
                id: requestdata.id,
                venue_id: requestdata.venue_id,

              }
            });
          const save2 = await Venu.update({
            // name: requestdata.name,
            email: requestdata.email,
            password: new_password

          }, {
              where: {
                terminal_id: requestdata.id,
                //venue_id: requestdata.venue_id,

              }
            });
          if (!save) {
            throw "Error in terminal updation."
          }
          return responseHelper.post(res, requestdata);
        } else {
          const check_mail = await Venu.findOne({
            attributes: ['email'],
            where: {
              email: requestdata.email
            }
          });
          if (check_mail) {
            throw "Email already taken, please select another"
          }

          const save = await Terminal.update({
            name: requestdata.name,
          }, {
              where: {
                id: requestdata.id,
                venue_id: requestdata.venue_id,

              }
            });
          const img = await Venu.findOne({
            attributes: ['image'],
            where: {
              id: requestdata.venue_id
            }
          });
          const ven = await Venu.create({
            name: requestdata.name,
            email: requestdata.email,
            password: new_password,
            image: img.dataValues.image,
            terminal_id: requestdata.id,
            is_verified: 1,
            user_type: 2,
          })

          if (!ven) {
            throw "Error in terminal updation."
          }

          return responseHelper.post(res, requestdata);
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async delete_terminal(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        // venue_id: req.body.venue_id,
        // name: req.body.name,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        /*  var user_data = await Terminal.findOne({
           where: {
             id: requestdata.id,
             venue_id: requestdata.venue_id,
           }
         });
         if (!user_data) {
           throw "Invalid id for delete."
         }

         const save = await Terminal.destroy({
           where: {
             id: requestdata.id,
             venue_id: requestdata.venue_id,

           }
         });
         if (!save) {
           throw "Error in terminal updation."
         } */
        var user_data = await Terminal.findOne({
          where: {
            id: requestdata.id,
            // venue_id: requestdata.venue_id,
          }
        });
        if (!user_data) {
          throw "Invalid id for delete."
        }

        let prdct = requestdata.id.split(",");
        const save = await Terminal.destroy({
          where: {
            id: { $in: prdct },
            //venue_id: requestdata.venue_id,

          }
        });
        if (save) {
          const save2 = await Venu.destroy({
            where: {
              terminal_id: { $in: prdct },
              user_type: 2
              //venue_id: requestdata.venue_id,

            }
          });
        }
        return responseHelper.post(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async list_terminal(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.body.venue_id,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {
        user_id: req.body.user_id == undefined ? 0 : req.body.user_id,
      };

      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        let final = [];

        let main = await Terminal.findAll({
          where: {
            venue_id: requestdata.venue_id,
            // is_main: 1,
          }
        });
        if (main) {
          await Promise.all(main.map(async c => {
            let main2 = await Venu.findOne({
              attributes: ['email', 'terminal_id', 'password', 'open'],
              where: {
                terminal_id: c.id,
                // is_main: 1,
              }
            });
            if (main2) {

              c.dataValues.credentials = main2
            } else {
              c.dataValues.credentials = {};

            }
          }));
        }
        /*  let Terminals = await Terminal.findAll({
            where: {
              venue_id: requestdata.venue_id,
              is_main: 0,
          }
          });
          Terminals.unshift(main); */
        if (!main) {
          return responseHelper.Error(res, [], 'Terminal not found');
        }

        const check_is_ordered = await Order.findOne({
          attributes: ['id'],
          where: {
            venue_id: requestdata.venue_id,
            user_id: requestdata.user_id
          },
          order: [
            ['id', 'DESC']
          ]
        });


        var checks = {
          is_reviewed: 0,
          is_ordered: 0,
          order_id: 0
        }

        if (check_is_ordered) {
          checks.is_ordered = 1;
          checks.order_id = check_is_ordered.dataValues.id;
          const check_is_reviewed = await VenueReviews.findOne({
            attributes: ['id'],
            where: {
              review_to: requestdata.venue_id,
              review_by: requestdata.user_id,
              order_id: check_is_ordered.dataValues.id
            },
          });
          if (check_is_reviewed) {
            checks.is_reviewed = 1;
          }

        }

        const newData = {
          terminals: main,
          checks: checks

        }


        // final.push(Terminals);


        // console.log(Terminals)    ;
        // return;
        //return responseHelper.post(res, Terminals);
        return responseHelper.post(res, newData);

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async main_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        terminal_id: req.query.terminal_id,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        let cat = await MainCategory.findAll();
        if (requestdata.terminal_id && requestdata.terminal_id != '') {
          if (cat && cat.length > 0) {
            await Promise.all(cat.map(async c => {
              let term = await Terminal.findOne({
                attributes: ['id', 'venue_id', 'main_category'],
                where: {
                  id: requestdata.terminal_id,
                  main_category: {
                    $in: [c.dataValues.id, 3]
                  }
                }
              });
              if (term) {
                c.dataValues.is_selected = 1
              } else {
                c.dataValues.is_selected = 0
              }
              const order_count = await Order.findAndCount({
                // where: {
                //   terminal_id: requestdata.terminal_id,
                //   status: {
                //     // $in: [1, 2, 3]
                //     $in: [1]
                //   },
                //   main_category_id: c.dataValues.id
                // }
                where: database.Sequelize.literal((`(status = 1 or is_refunded = 1 and venueBadgeSeen = 0) and terminal_id='${requestdata.terminal_id}' and main_category_id='${c.dataValues.id}' `)),
              });
              c.dataValues.order_count = order_count.count
            }));
          }
        }
        // console.log(Terminals)    ;
        // return;
        return responseHelper.post(res, cat);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async categories(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,

        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var Terminals = await MainCategory.findAll({
          include: [{
            model: Categories,
            where: {
              for_all: 1
            }
          }],


        });
        // console.log(Terminals);
        var final = {};
        // for(var val of Terminals) {
        //   // console.log(val.dataValues.title);

        //   final.val.dataValues.title = await Categories.findAll({
        //     where: {
        //       // venue_id: requestdata.venue_id,
        //       for_all: 1,  
        //       main_category_id: val.dataValues.id,  
        //     }
        //   });
        //   // final.val.dataValues.title = data;
        //   // console.log(final)    ;

        // }

        // console.log(final)    ;
        // return;
        return responseHelper.post(res, Terminals);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async change_password(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        old_password: req.body.old_password,
        password: req.body.password,
        user_type: req.body.user_type,
        //table_name: 'venues',
        //checkexit: 2
      };
      const non_required = {};
      // console.log(required);
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var user_data = await Venu.findOne({
          where: {
            id: requestdata.id,
            user_type: requestdata.user_type,
          }
        });
        if (user_data) {
          required.old_password = helpers.crypt(required.old_password);
          if (user_data.dataValues.password == required.old_password) {
            const save = await Venu.update(requestdata, { where: { id: requestdata.id } });
            if (save) {
              return responseHelper.post(res, requestdata);
            } else {
              throw "Error in update password"
            }
          } else {
            throw "Invalid old password"
          }
        } else {
          throw "Invalid id"
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async add_card(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // token: req.headers.token,
        venue_id: req.body.venue_id,
        card_type: req.body.card_type,
        card_number: req.body.card_number,
        card_expiry: req.body.card_expiry,
        dob: req.body.dob,
        user_type: req.body.user_type,

        // bsb: req.body.bsb,        
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      // console.log(required);
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        if (requestdata.user_type != 1) {
          throw "Invalid user_type";
        }
        let str = requestdata.card_type;
        requestdata.card_type = str.toLowerCase();
        //console.log(requestdata.card_type); return ;

        let expiry_date = requestdata.card_expiry;
        let expiry = expiry_date.split('/');
        let expiry_month = expiry[0];
        let expiry_year = expiry[1];
        requestdata.card_expiry = expiry_month + '/' + '20' + expiry_year;

        //console.log(requestdata.card_expiry); return ;
        let user_create = await Card.create(requestdata)

        if (!user_create) {
          throw "Error while Card data insertion";
        }

        var u_data = {};
        u_data.dob = requestdata.dob;
        u_data.card_id = user_create.dataValues.id;
        const save = await Venu.update(u_data, { where: { id: requestdata.venue_id } });

        return responseHelper.post(res, {
          card_id: u_data.card_id
        });

      }
    } catch (err) {
      // throw err;
      console.log(err.message);
      return responseHelper.onError(res, err, "Error while Card data insertion");
    }
  }
  async edit_card(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        card_id: req.body.card_id,
        venue_id: req.body.venue_id,
        card_type: req.body.card_type,
        card_number: req.body.card_number,
        card_expiry: req.body.card_expiry,
        dob: req.body.dob,
        user_type: req.body.user_type,

        // bsb: req.body.bsb,        
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      // console.log(required);
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        if (requestdata.user_type != 1) {
          throw "Invalid user_type";
        }
        let str = requestdata.card_type;
        requestdata.card_type = str.toLowerCase();

        let expiry_date = requestdata.card_expiry;
        let expiry = expiry_date.split('/');
        let expiry_month = expiry[0];
        let expiry_year = expiry[1];
        requestdata.card_expiry = expiry_month + '/' + '20' + expiry_year;

        let user_create = await Card.update(requestdata, {
          where: {
            id: requestdata.card_id
          }
        })

        if (!user_create) {
          throw "Error while Card data insertion";
        }
        var u_data = {};
        u_data.dob = requestdata.dob;
        const save = await Venu.update(u_data, { where: { id: requestdata.venue_id } });


        return responseHelper.post(res, {});

      }
    } catch (err) {
      // throw err;

      return responseHelper.onError(res, err, err);
    }
  }
  async login(req, res) {
    try {
      const required = {
        email: req.body.email,
        password: req.body.password,
        security_key: req.headers.security_key,
        checkexit: 2
      };
      const non_required = {
        device_type: req.body.device_type == undefined ? 0 : req.body.device_type,
        device_token: req.body.device_token == undefined ? 0 : req.body.device_token,
        latitude: req.body.latitude == undefined ? 0 : req.body.latitude,
        longitude: req.body.longitude == undefined ? 0 : req.body.longitude
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var user_data = await Venu.findOne({
          where: {
            email: requestdata.email,
            password: requestdata.password
          }
        });
        if (!user_data) {
          throw "Invalid login detail";
        }
        let user_dataa = await Venu.findOne({
          where: {
            email: requestdata.email,
            password: requestdata.password,
            is_verified: 1
          }
        });
        if (!user_dataa) {
          throw "Please verify your account to login";
        }
        // let check =await Suspend.findOne({
        //   where :{
        //     user_id: user_data.dataValues.id,             
        //     status :1
        //   }
        // });
        // if(check){
        //   throw "Your account is suspended,contact to admin.";
        // }
        var update_data = {
          device_type: requestdata.device_type,
          device_token: requestdata.device_token,
          latitude: requestdata.latitude,
          longitude: requestdata.longitude
        };
        user_data.device_type = requestdata.device_type;
        user_data.device_token = requestdata.device_token;
        user_data.latitude = requestdata.latitude;
        user_data.longitude = requestdata.longitude;

        const save = await Venu.update(update_data, { where: { id: user_data.dataValues.id } });
        const credentials = {
          id: user_data.dataValues.id,
          password: user_data.dataValues.password,
          email: user_data.dataValues.email
        };
        var data = await Venu.findOne({
          where: {
            id: user_data.dataValues.id,
          }
        });
        /* if (data.dataValues.user_type == 1) {
          delete data.dataValues.paypal_id
        } */
        const token = jwt.sign(credentials, jwtToken, { algorithm: 'HS256' });
        data.dataValues.token = token;
        var card_data = await Card.findOne({
          where: {
            venue_id: data.dataValues.id,
          }
        });
        data.dataValues.card_data = card_data;
        if(data.user_type == 2){
          let venue = await Terminal.findOne({
            attribute:['venue_id'],
            where:{
              id:data.terminal_id
            }
          });
          data.dataValues.terminal_venue_id = 0;
          if(venue){
            data.dataValues.terminal_venue_id = venue.venue_id;
          }
        }


        // var send = Object.assign({}, user_data, save);
        return responseHelper.post(res, data);
      }
    } catch (err) {
      // console.log(err);
      // throw err;
      return responseHelper.onError(res, err, err);

    }
  }
  
  async get_profile(req, res) {
    try {
      const required = {
        user_id: req.query.user_id,
      };
      const non_required = {
        
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      
      var user = await Venu.findOne({
        where: {
          id: requestdata.user_id,
        }
      });

      var card_data = await Card.findOne({
        where: {
          venue_id: user.dataValues.id,
        }
      });
      user.dataValues.card_data = card_data;
  
      return responseHelper.post(res, user);
      
    } catch (err) {
      // console.log(err);
      // throw err;
      return responseHelper.onError(res, err, err);

    }
  }
  async checking_category_exist(req, res) {
    try {
      var row = await Categories.findOne({
        where: {
          id: { $not: req.body.table_id },
          name: req.body.name,
          main_category_id: req.body.main_category_id,
          venueId: req.body.venueId,
        }
      });
      if (row) {
        throw 'This category is already exist.';
      } else {
        return true;
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async add_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // token: req.headers.token,
        venueId: req.body.venueId,
        main_category_id: req.body.main_category_id,
        name: req.body.name,
        table_name: 'venues',
        image: req.files,
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        var file_name = helper.file_upload(req.files.image)
        requestdata.image = constant.image_url + file_name;
        var row = await Categories.findOne({
          where: {
            id: { $not: 0 },
            name: req.body.name,
            main_category_id: req.body.main_category_id,
            venueId: req.body.venueId,
          }
        });
        // console.log(row);
        // return;
        if (row) {
          throw 'This category is already used.';
        }

        const save = await Categories.create(requestdata);
        if (!save) {
          throw "Error in Categories additon."
        }
        return responseHelper.post(res, requestdata);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async edit_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        venueId: req.body.venueId,
        main_category_id: req.body.main_category_id,
        name: req.body.name,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var user_data = await Categories.findOne({
          where: {
            id: requestdata.id,
            venueId: requestdata.venueId,
          }
        });
        if (!user_data) {
          throw "Invalid id for updation."
        }
        var row = await Categories.findOne({
          where: {
            id: { $not: requestdata.id },
            name: requestdata.name,
            main_category_id: requestdata.main_category_id,
            venueId: requestdata.venueId,
          }
        });
        if (row) {
          throw 'This category is already used.';
        }
        // console.log(req.files);
        if (req.files && req.files.image) {
          var file_name = helper.file_upload(req.files.image)
          requestdata.image = constant.image_url + file_name;
        }
        const save = await Categories.update(requestdata, {
          where: {
            id: requestdata.id,
            venueId: requestdata.venueId,

          }
        });
        if (!save) {
          throw "Error in Categories updation."
        }
        return responseHelper.put(res, requestdata);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async delete_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        venueId: req.body.venueId,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var user_data = await Categories.findOne({
          where: {
            id: requestdata.id,
            venueId: requestdata.venueId,
          }
        });
        if (!user_data) {
          throw "Invalid id for delete."
        }

        const save = await Categories.destroy({
          where: {
            id: requestdata.id,
            venue_id: requestdata.venueId,

          }
        });
        if (!save) {
          throw "Error in Categories updation."
        }
        return responseHelper.del(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async list_categories(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        // venue_id: req.query.venue_id,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var Categoriess = await Categories.findAll({
          where: {
            // venue_id: requestdata.venue_id,
            for_all: 1,

            main_category_id: requestdata.main_category_id,

          }
        });
        // console.log(Categoriess)    ;
        // return;
        return responseHelper.get(res, Categoriess);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async add_sub_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // token: req.headers.token,
        venueId: req.body.venueId,
        main_category_id: req.body.main_category_id,
        categoryId: req.body.categoryId,
        name: req.body.name,
        table_name: 'venues',
        //image: req.files,        
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        // var file_name=helper.file_upload(req.files.image)
        //requestdata.image=constant.image_url+file_name;
        let row = await Subcat.findOne({
          where: {
            // id: { $not: 0 },
            name: requestdata.name,
            main_category_id: requestdata.main_category_id,
            category_id: requestdata.categoryId,
            is_deleted: 0
            //venueId: req.body.venueId,
          }
        });
        if (row) {
          throw 'This Sub-category is already present in the selected category';
        }

        const save = await Subcat.create(requestdata);
        if (!save) {
          throw "Error in Subcat additon."
        }
        return responseHelper.post(res, requestdata);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async edit_sub_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        venueId: req.body.venueId,
        main_category_id: req.body.main_category_id,
        categoryId: req.body.categoryId,
        name: req.body.name,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var user_data = await Subcat.findOne({
          where: {
            id: requestdata.id,
            //venueId: requestdata.venueId,
            is_deleted: 0
          }
        });
        if (!user_data) {
          throw "Invalid id for updation."
        }
        let row = await Subcat.findOne({
          where: {
            id: { $not: requestdata.id },
            name: requestdata.name,
            main_category_id: requestdata.main_category_id,
            //venueId: requestdata.venueId,
            category_id: requestdata.categoryId,
            is_deleted: 0

          }
        });
        if (row) {
          throw 'This Sub-category is already present in the selected category';
        }
        /*   if (req.files && req.files.image) {
              var file_name = helper.file_upload(req.files.image)
              requestdata.image = constant.image_url + file_name;
          } */
        const save = await Subcat.update(requestdata, {
          where: {
            id: requestdata.id,
            //venueId: requestdata.venueId,

          }
        });
        if (!save) {
          throw "Error in Subcat updation."
        }
        return responseHelper.put(res, requestdata);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async delete_sub_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        venueId: req.body.venueId,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var user_data = await Subcat.findOne({
          where: {
            id: requestdata.id,
            venueId: requestdata.venueId,
            is_deleted: 0
          }
        });
        if (!user_data) {
          throw "Invalid id for delete."
        }

        const save = await Subcat.update({
          is_deleted: 1
        }, {
            where: {
              id: requestdata.id,
              venue_id: requestdata.venueId,

            }
          });
        if (!save) {
          throw "Error in Subcat updation."
        }
        return responseHelper.del(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async list_sub_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
        main_category_id: req.query.main_category_id,
        category_id: req.query.category_id,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var Subcats = await Subcat.findAll({
          where: {
            // venue_id: requestdata.venue_id,
            main_category_id: requestdata.main_category_id,
            category_id: requestdata.category_id,
            is_deleted: 0
          }
        });
        // console.log(Subcats)    ;
        // return;
        return responseHelper.get(res, Subcats);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async add_product(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        name: req.body.name,
        brand_id: req.body.brand_id,
        quantity: req.body.quantity,
        price: req.body.price,
        venue_id: req.body.venue_id,
        main_category_id: req.body.main_category_id,
        category_id: req.body.category_id,
        subcategory_id: req.body.subcategory_id,
        // cat_data: req.body.cat_data,      
        image: req.files,
        table_name: 'venues',
        // checkexit: 2
      };
      const non_required = {
        description: req.body.description,
        brand_name: req.body.brand_name,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        var file_name = helper.file_upload(req.files.image)
        requestdata.image = constant.image_url + file_name;
        /*  const save = await Product.create(requestdata);
         if (!save) {
           throw "Error in Product additon.";
         }
         return responseHelper.post(res, requestdata); */
        const terminal = await Terminal.findAll({
          //attributes : ['id','name','venue_id'],
          where: {
            venue_id: requestdata.venue_id
          }
        });
        if (terminal.length > 0) {

          // //check last product id

          // let product = await Product.finOne({
          //     attributes:['id','product_id'],
          //     order:['id','DESC']
          // });

          // if(product){
          //     requestdata.product_id = product.product_id+1;
          // }
          // else{
          //     requestdata.product_id = 1;
          // }
          var brand_id = 0
          if (requestdata.main_category_id == 1) {

            if (requestdata.brand_id == 0) {

              var check_brand_name = await Brand.findOne({
                where: {
                  name: requestdata.brand_name
                }
              });
              if (check_brand_name) {
                /*   console.log(check_brand_name.dataValues.id,"dataValues.id"); */
                brand_id = check_brand_name.dataValues.id
              } else {
                let brand = await Brand.create({
                  name: requestdata.brand_name
                });
                /*  console.log(brand.dataValues.id,"brand=============") */
                brand_id = brand.dataValues.id
              }
            } else {
              brand_id = requestdata.brand_id;
            }
          }
          await Promise.all(terminal.map(async t => {
            var _productss = await Product.create({
              terminal_id: t.id,
              venue_id: requestdata.venue_id,
              brand_id: brand_id,
              name: requestdata.name,
              category_id: requestdata.category_id,
              main_category_id: requestdata.main_category_id,
              subcategory_id: requestdata.subcategory_id,
              price: requestdata.price,
              image: requestdata.image,
              quantity: requestdata.quantity,
              description: requestdata.description,

            });

          }));
          //return responseHelper.post(res, _productss);
        } else {
          throw "No venue found to add product";
        }

        return responseHelper.post(res, {});

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async edit_product(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        name: req.body.name,
        // terminal_id: req.body.terminal_id,  
        brand_id: req.body.brand_id,

        price: req.body.price,
        venue_id: req.body.venue_id,
        main_category_id: req.body.main_category_id,
        category_id: req.body.category_id,
        subcategory_id: req.body.subcategory_id,
        quantity: req.body.quantity,
        //unit: req.body.unit,


        // cat_data: req.body.cat_data,      
        // image: req.files,    
        table_name: 'venues',
      };
      const non_required = {
        description: req.body.description,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        let user_data = await Product.findOne({
          where: {
            id: requestdata.id,
            venue_id: requestdata.venue_id,
            is_deleted: 0,
          }
        });
        if (user_data) {

          if (req.files && req.files.image) {
            var file_name = helper.file_upload(req.files.image)
            requestdata.image = constant.image_url + file_name;
          }
          let desc = "";
          if (req.body && req.body.description && req.body.description != '') {
            requestdata.description = req.body.description;
            desc = requestdata.description;
          }
          const save = await Product.update({
            //id: req.body.id,
            name: requestdata.name,
            // terminal_id: req.body.terminal_id,  
            brand_id: requestdata.brand_id,
            description: desc,
            price: requestdata.price,
            venue_id: requestdata.venue_id,
            main_category_id: requestdata.main_category_id,
            category_id: requestdata.category_id,
            subcategory_id: requestdata.subcategory_id,
            quantity: requestdata.quantity,
            image: requestdata.image
          }, {
              where: {
                //'admin_product_id': user_data.dataValues.admin_product_id
                id: requestdata.id
              }
            });
          if (!save) {
            throw "Error in Product updation.";
          }

          return responseHelper.put(res, requestdata);
        } else {
          throw "Invalid product id";
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async delete_product(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.body.venue_id,
        // name: req.body.name,       
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {
        id: req.body.id,
        admin_product_id: req.body.admin_product_id,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      console.log('=====================================>', requestdata)
      if (requestdata != "") {
        if (requestdata.id != undefined) {

          var user_data = await Product.findOne({
            where: {
              id: requestdata.id,
              venue_id: requestdata.venue_id,
              is_deleted: 0

            }
          });
          if (!user_data) {
            throw "Invalid id for delete."
          }

          let prdct = requestdata.id.split(",");
          const save = await Product.update({
            is_deleted: 1
          }, {
              where: {
                id: { $in: prdct },
                //venue_id: requestdata.venue_id,

              }
            });
          // await prdct.forEach(async(product)=>{
          //     let productName = await Product.findOne({
          //         where:{
          //             id:product
          //         },
          //         attributes:['name']
          //     });
          //     const save = await Product.update({
          //         is_deleted: 1
          //     }, {
          //         where: {
          //             name:productName.name,
          //             admin_product_id:{ $eq: 0}

          //         }
          //     });

          // })

        }
        // if(requestdata.admin_product_id != undefined){
        //     let prdct = requestdata.admin_product_id.split(",");
        //     const save = await Product.update({
        //         is_deleted: 1
        //     }, {
        //         where: {
        //             admin_product_id: { $in: prdct },
        //             venue_id: requestdata.venue_id,
        //             //venue_id: requestdata.venue_id,

        //         }
        //     });
        // }

        /*  if (!save) {
           throw "Error in Product updation."
         }
         await Product_category.destroy({
           where: {
             'product_id': requestdata.id
           },
           // truncate: true
         }
         ); */
        return responseHelper.del(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async brand_list(req, res) {
    try {
      let brands = await Brand.findAll({
        attributes: ['id', 'name']
      })
      return responseHelper.get(res, brands);
    }
    catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async list_product(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        terminal_id: req.query.terminal_id,
        type: req.query.type, // 1 customer 2 venu
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        category_id: req.query.category_id == undefined ? 0 : req.query.category_id,
        subcategories: req.query.subcategories == undefined ? 0 : req.query.subcategories,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        // console.log(requestdata);  
        // return ; 
        var subcategories_ids = requestdata.subcategories;
        var productids = [];
        var conditons = {};
        conditons.venue_id = requestdata.venue_id;
        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.category_id = requestdata.category_id;
        conditons.is_deleted = 0;
        var Products = await Product.findAll({
          attributes: ['id', 'name', 'brand_id', 'category_id', 'main_category_id', 'venue_id', 'terminal_id', 'subcategory_id', 'admin_product_id', 'price', 'image', 'description', 'quantity', 'cat_data', 'status', 'createdAt', 'updatedAt'],
          where: conditons,
          // /group: ['name'],
          // order: [
          //     [[db.sequelize.literal('SUBSTRING(products.name, 1, 3) ')]],
          //     [db.sequelize.col('`sub_category`.`name`'), 'ASC'],
          // ],
          order: [
            ['name', 'ASC'],

          ],
          include: [
            // { model: Venu, attributes: ['id','name', 'image', 'email'] },
            // { model: MainCategory, attributes: ['id', 'title'] },
            //  { model: Categories, attributes: ['id','name', 'image',] }, 
            { model: Brand, attributes: ['id', 'name'] },
            {
              model: Subcat,
              as: 'sub_category',
              attributes: ['name'],
              where: {
                is_deleted: 0
              },
            }
          ],
        });
        if (Products) {
          await Promise.all(Products.map(async p => {
            delete p.dataValues.subcategory;
          }));
        }
        // ads data 
        let user = await Venu.findOne({
          where: {
            id: req.user.id
          },
          attributes: ['id', 'dob', 'gender']
        });
        /*        console.log(user,"user") */
        //cal age
        // let date = new Date(user.dataValues.dob).getDate();
        // let month = new Date(user.dataValues.dob).getMonth() + 1;
        // let year = new Date(user.dataValues.dob).getFullYear();

        let dobsplit = user.dataValues.dob.split("/");
        let date = dobsplit[0];
        let month = dobsplit[1];
        let year = dobsplit[2];

        var age = helpers.calculateAge2(year, month, date);
        // console.log(req);
        /* console.log(age,"=================year"); */


        if (requestdata.type == 1) {
          var get_ads = await Ads.findAll({
            attributes: ['id', 'title', 'description', 'media', 'link', 'createdAt'],
            where: {
              venue_id: requestdata.venue_id,
              min_age: {
                [Op.lte]: age // square brackets are needed for property names that aren't plain strings
              },
              max_age: {
                [Op.gte]: age // square brackets are needed for property names that aren't plain strings
              },

              $or: [
                { 
                  gender: user.gender
                },
                {
                  gender: 3
                }
              ]
            },
            include:{
              model:TerminalAds,
              attributes:['terminal_id'],
              where:{
                terminal_id:requestdata.terminal_id
              }
            },
            // order: [
            //   [Sequelize.fn('RAND')]
            // ]
            order: [
              ['id', 'desc']
            ]
          });
        } else {

          var get_ads = await Ads.findAll({
            attributes: ['id', 'title', 'description', 'media', 'link', 'createdAt'],
            where: {
              venue_id: requestdata.venue_id,

              $or: [
                {
                  gender: user.gender
                },
                {
                  gender: 3
                }
              ]
            },
            include:{
              model:TerminalAds,
              attributes:['terminal_id'],
              where:{
                terminal_id:requestdata.terminal_id
              }
            },
            // order: [
            //   [Sequelize.fn('RAND')]
            // ]
            order: [
              ['id', 'desc']
            ]
          });

        }

        const newData = {
          ProductsList: Products,
          AdsList: get_ads
        };
        return responseHelper.get(res, newData);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async list_cat_subCat(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        category_id: req.query.category_id == undefined ? 0 : req.query.category_id,
        subcategories: req.query.subcategories == undefined ? 0 : req.query.subcategories,


      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        // console.log(requestdata);  
        // return ; 

        var subcategories_ids = requestdata.subcategories;
        var productids = [];
        var conditons = {};
        //conditons.venue_id=requestdata.venue_id;
        //conditons.main_category_id=requestdata.main_category_id;
        // conditons.category_id=requestdata.category_id;


        // console.log(subcategories_ids);
        // if(subcategories_ids){
        //   // console.log(conditons);
        //   // return ;
        //   var sub_cat = await Product_category.findAll({
        //     group :'product_id',
        //     attributes: ['product_id', 'category_id'],
        //     where: {
        //       subcategories   :{ 
        //         $in:JSON.parse("[" + subcategories_ids + "]")
        //       },
        //       venue_id: requestdata.venue_id,
        //     },          
        //   });
        //   if(sub_cat){
        //     for(var product_id of sub_cat){
        //       // console.log(product_id);
        //       // return; 
        //       productids.push(product_id.dataValues.product_id);
        //     } 
        // console.log(productids);
        // return ;
        //  productids=[]; 
        //   }
        // }
        //   var category_ids =requestdata.category_id ;

        //   if(category_ids){
        //     var cat = await Product_category.findAll({
        //       group :'product_id',
        //       attributes: ['product_id', 'category_id'],
        //       where: {
        //         category_id   :{ 
        //           $in:JSON.parse("[" + category_ids + "]")
        //         },
        //         venue_id: requestdata.venue_id,
        //       },          
        //     });
        //     if(cat){
        //       for(var product_id of cat){
        //         // console.log(product_id);
        //         // return; 
        //         productids.push(product_id.dataValues.product_id);
        //       } 
        //       // console.log(productids);
        //       // return ;
        //     //  productids=[]; 
        //   }
        // }
        // if(typeof productids != 'undefined' && productids.length>0){
        //   // console.log(productids);

        //   conditons.id ={ $in :productids};
        // }

        var category = await Categories.findAll(

          {
            attributes: ['id', 'name', 'image', 'main_category_id' /* ,'name','category_id','main_category_id','venue_id','terminal_id','subcategory_id','price','image','description','cat_data','status', 'createdAt','updatedAt' */],
            /*  include: [
            { model: Categories,  attributes: ['id','name', ] }, 
            { model: MainCategory, attributes: ['id','title',] }  ],   */
            where: { main_category_id: requestdata.main_category_id }
          },

        );
        if (category) {
          await Promise.all(category.map(async c => {
            const subCat = await Subcat.findAll({
              attributes: ['id', 'name', 'category_id'],
              where: {
                category_id: c.dataValues.id,
                main_category_id: requestdata.main_category_id,
                // venue_id: requestdata.venue_id,
                is_deleted: 0
              }

            })
            c.dataValues.sub_categories = subCat;

            const mainCategory = await MainCategory.findAll({
              attributes: ['id', 'title'],
              where: {
                id: c.dataValues.main_category_id
              }
            })
            c.dataValues.main_category = mainCategory;
            delete c.dataValues.main_category_id;
          }));
        }

        //console.log(category)    ;
        // return;
        return responseHelper.get(res, category);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async current_order_listing(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        // category_id: req.query.category_id == undefined ? 0 : req.query.category_id,
        // subcategories: req.query.subcategories == undefined ? 0 : req.query.subcategories, 


      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        // console.log(requestdata);  
        // return ; 

        // var subcategories_ids =requestdata.subcategories ;
        var productids = [];
        var conditons = {};

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 
        // var to_time= 86400 +'+'+ t_t;
        var to_time = parseInt(86400) + parseInt(t_t);
        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = { $not: 4 };

        conditons.createdAt = {
          $lte: to_time,
          $gte: t_t
        };

        // console.log(conditons);
        var Orders = await Order.findAll({
          include: [{
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          order: [
            ['id']
          ],
          where: conditons
        });
        // Math.floor(Date.now() / 1000),

        // console.log(t_t/1000);
        if (Orders && Orders.length > 0) {
          for (let c in Orders) {
            Orders[c].dataValues.order_number = parseInt(c) + 1;
          }
        }
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async past_order_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 
        // var to_time= 86400 +'+'+t_t;
        var to_time = parseInt(86400) + parseInt(t_t);

        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = 4;
        // conditons.createdAt ={
        //   $lte : Math.floor(Date.now() / 1000),          
        // };          

        var Orders = await Order.findAll({
          include: [{
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          order: [
            ['id']
          ],
          where: conditons
        });
        if (Orders && Orders.length > 0) {
          for (let c in Orders) {
            Orders[c].dataValues.order_number = parseInt(c) + 1;
          }
        }
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async today_customer_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        today: 1,
        // today: req.query.today,

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 
        // var to_time= 86400 +'+'+t_t;
        var to_time = parseInt(86400) + parseInt(t_t);

        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        // conditons.status = 4;
        conditons.status = {
          $in: [2, 3, 4]
        };
        conditons.conclude_status = 0;
        if (requestdata.today == 1) {
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }



        var Orders = await Order.findAll({
          // include :[{

          //   model : User,
          //       as: 'userDetails',
          //       attributes :[
          //         'id','name','image'
          //       ]
          //     }
          // ],
          attributes: ['user_id'],
          group: ['user_id'],
          order: [
            ['id']
          ],
          where: conditons
        });
        let user_ids = [];
        if (Orders && Orders.length > 0) {
          for (var val of Orders) {
            user_ids.push(val.dataValues.user_id)
          }
        }

        // console.log(Orders);
        var Users = await User.findAll({
          attributes: [
            'id', 'name', 'image'
          ],
          where: {
            id: { $in: user_ids }
          }
        })
        return responseHelper.get(res, Users);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async user_order_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // main_category_id: req.query.main_category_id,
        user_id: req.query.user_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};

        conditons.user_id = requestdata.user_id;
        // conditons.main_category_id=requestdata.main_category_id;
        // conditons.status=3;
        conditons.createdAt = {
          $lte: Math.floor(Date.now() / 1000),
        };


        let Orders = await Order.findAll({
          attributes: [/* [Sequelize.fn("max", Sequelize.col('orders.id')), 'orderid'], */'id', 'createdAt', [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date']],
          include: [{
            model: Venu,
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          //group: ['date'],
          group: ['venue_id', 'date'],
          order: [
            ['createdAt', 'DESC']
          ],

          where: conditons
        });
        //console.log(Orders[0].dataValues.venue.dataValues.id);return;
        if (Orders && Orders.length > 0) {
          await Promise.all(Orders.map(async c => {
            let check = await Suspend.count({
              where: {
                user_id: requestdata.user_id,
                venue_id: c.dataValues.venue.dataValues.id,
                status: 1
              }
            });
            if (check) {
              c.dataValues.venue.dataValues.is_suspended = 1
            } else {
              c.dataValues.venue.dataValues.is_suspended = 0
            }
            var update_time = moment.unix(c.dataValues.createdAt).format("YYYY-MM-DD");
            var to_time = parseInt(86400) + parseInt(c.dataValues.createdAt);
            let ready_orders_count = await Order.count({
              where: {
                // $or: [
                //   {
                //     status: 3
                //   },
                //   {
                //     status: 2
                //   }
                // ],
                // venue_id: c.dataValues.venue.dataValues.id,
                // // terminal_id: c.terminal.id,
                // user_id: requestdata.user_id,
                // createdAt: {
                //   $lte: to_time,
                //   $gte: c.dataValues.createdAt,
                // },
                where: database.Sequelize.literal((`(status = 3 or status=2 or is_refunded = 1 and userBadgeSeen = 0)  AND date(FROM_UNIXTIME(createdAt)) = '${update_time}' and user_id='${requestdata.user_id}' and venue_id='${c.dataValues.venue.dataValues.id}' `)),

              }
            });
            if (ready_orders_count) {
              c.dataValues.venue.dataValues.ready_orders_count = ready_orders_count
            } else {
              c.dataValues.venue.dataValues.ready_orders_count = 0
            }
          }));
        }

        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async order_round_by_date(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        date_timestamp: req.query.date_timestamp,
        user_id: req.query.user_id,
        venue_id: req.query.venue_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};
        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 

        var to_time = parseInt(86400) + parseInt(requestdata.date_timestamp);
        console.log(to_time, "safdfsdfd");

        conditons.user_id = requestdata.user_id;
        conditons.venue_id = requestdata.venue_id;
        conditons.terminal_id = requestdata.terminal_id;
        // conditons.main_category_id=requestdata.main_category_id;
        // conditons.status=3;
        var update_time = moment.unix(requestdata.date_timestamp).format("YYYY-MM-DD");

        /*         console.log(update_time,"update_time"); */
        /*  conditons.createdAt = {
           $lte: to_time,
           $gte: requestdata.date_timestamp,
         }; */
        // conditons.conclude_status = {
        //     $eq: 0
        // };


        var Orders = await Order.findAll({
          include: [{
            model: Venu,
            attributes: [
              'id', 'name', 'image']
          }],
          order: [
            ['id']
          ],
          where: database.Sequelize.literal((`date(FROM_UNIXTIME(createdAt)) = '${update_time}' and user_id='${requestdata.user_id}' and venue_id='${requestdata.venue_id}' and orders.terminal_id='${requestdata.terminal_id}'`)),


        });

        await Order.update({
          userBadgeSeen:1
        },{
          where: database.Sequelize.literal((`date(FROM_UNIXTIME(createdAt)) = '${update_time}' and user_id='${requestdata.user_id}' and venue_id='${requestdata.venue_id}' and orders.terminal_id='${requestdata.terminal_id}'`)),
        })
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async order_detail(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        order_id: req.query.order_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};
        conditons.venue_id = requestdata.venue_id;
        conditons.id = requestdata.order_id;
        var Orders = await Order.findOne({
          include: [{
            model: Terminal,
            attributes: [
              'id', 'name', 'table_number', 'is_main'
            ]
          },
          {
            model: Venu,
            attributes: [
              'id', 'name', 'image', 'avg_rating'
            ]
          },
          {
            model: Subcat,
            attributes: [
              'id', 'name'
            ]
          },
          {
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          },
          {
            model: OrderDetail,
            attributes: ['quantity', 'price', 'instructions', 'size', 'product_name'],
            include: {
              model: Product,
              attributes: ['name', 'price', 'image', 'description', 'quantity'],
              include: [{
                model: Subcat,
                attributes: [
                  'name'
                ]
              }, {
                model: Brand,
                attributes: [
                  'name'
                ]
              }],
            }
          },
          ],
          order: [
            ['id'],
            [db.sequelize.col('`orderDetails->product->brand`.`name`'), 'ASC'],
            [db.sequelize.col('`orderDetails.product_name`'), 'ASC'],
            [db.sequelize.col('`orderDetails`.`size`'), 'DESC']
          ],
          where: conditons
        });
        // console.log(Orders);
        // return;
        if (!Orders) {
          return responseHelper.Error(res, {}, 'No data found');
        }
        //
        var currentDate = new Date(Orders.dataValues.createdAt * 1000);
        /*  console.log(currentDate,"currentDate") */
        var date = currentDate.getDate();
        /* console.log(date,"date") */
        var month = currentDate.getMonth();
        /* console.log(month,"month") */
        var year = currentDate.getFullYear();
        /* console.log(year,"year") */
        var monthDateYear = year + "-" + (month + 1) + "-" + date;
        /* console.log(monthDateYear); */
        var t = new Date(monthDateYear);
        /*  console.log(t,"t") */
        var t_t = (t.getTime()) / 1000;
        /* console.log(t_t,"t_t============") */
        // var update_time = moment(1578002680).format("YYYY-MM-DD");
        var UTCDateTimestamp = new Date(Orders.createdAt * 1000); 
        var UTCDate = UTCDateTimestamp.getUTCDate();
        var UTCMonth = UTCDateTimestamp.getUTCMonth()+1;
        var UTCYear = UTCDateTimestamp.getUTCFullYear();

        var update_time = UTCYear+'-'+UTCMonth+'-'+UTCDate;
      
        console.log(update_time, "=============update_time")
        var to_time = parseInt(86400) + parseInt(t_t);
        console.log(to_time, "to_time");
        var queue = await Order.count({
          where: {
            terminal_id: Orders.dataValues.terminal_id,
            id: {
              $lte: requestdata.order_id,
            },
            /* createdAt: {
              $lte: to_time,
              $gte: t_t
            }, */
            where: database.Sequelize.literal((`date(FROM_UNIXTIME(createdAt)) = '${monthDateYear}'`)),
            status: {
              $not: [4,5]
            },
          }
        });
        let round = await Order.count({
          attributes:['id'],
          // where: {
          //   //venue_id:  Orders.dataValues.venue_id,
          //   user_id: Orders.dataValues.user_id,
          //   terminal_id: Orders.dataValues.terminal_id,
          //   id: {
          //     $lte: requestdata.order_id,
          //   },
            // createdAt: {
            //   $lte: to_time,
            //   $gte: t_t
            // },
            where: database.Sequelize.literal((`date(FROM_UNIXTIME(createdAt)) = '${monthDateYear}' and user_id='${Orders.dataValues.user_id}' and venue_id='${Orders.dataValues.venue_id}' and orders.terminal_id='${Orders.dataValues.terminal_id}' and orders.id <= ${Orders.dataValues.id} `)),
            //  status :{
            //    $not : 3
            //  }
          //}
        });
        /*  console.log(round,"ajbfjs");return; */
        Orders.dataValues.queue = queue;
        Orders.dataValues.round = round;
        /* console.log( Orders.dataValues.round ," Orders.dataValues.round ") */
        // check suspend status by venue
        let check = await Suspend.count({
          where: {
            user_id: Orders.dataValues.user_id,
            venue_id: requestdata.venue_id,
            status: 1
          }
        });
        if (check) {
          Orders.dataValues.suspend_by_venue = 1;
        } else {
          Orders.dataValues.suspend_by_venue = 0;
        }
        let incremented_time = Orders.dataValues.createdAt + 15 * 60;
        Orders.dataValues.fifteen_min_time = incremented_time;
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async last_order_detail(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
        terminal_id: req.query.terminal_id,
        user_id: req.query.user_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};


        conditons.venue_id = requestdata.venue_id;
        let last_id = await Order.find({
          attributes: ['id'],
          where: {
            status: {
              $in: [1, 2, 3, 4]
            },
            user_id: requestdata.user_id,
            venue_id: requestdata.venue_id,
            terminal_id: requestdata.terminal_id
          },
          order: [
            ['id', 'DESC']
          ],

        });

        if (!last_id) {
          throw "No last order";
        }

        conditons.id = last_id.dataValues.id;
        var Orders = await Order.findOne({
          include: [{
            model: Venu,
            attributes: [
              'id', 'name', 'image'
            ]
          },
          {
            model: OrderDetail,
            // attributes :['quantity','price','category_id'],
            include: {
              model: Product,
              include: [{
                model: Subcat, attributes: ['name'], as: 'sub_category'
                // attributes :['name','price','image','description'],
                //  model: Subcat, attributes: ['id', 'name'] ,as: 'sub_category' 
              }, {
                model: Brand, attributes: ['id', 'name']
              }]
              // attributes :['name','price','image','description'],
              //  model: Subcat, attributes: ['id', 'name'] ,as: 'sub_category' 
            }
          },
          ],
          where: conditons,
        });
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async venue_list(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,
        q: req.query.q,
        user_id: req.query.user_id,
        // type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        // console.log(requestdata);
        let keywordd = requestdata.q;
        keywordd = keywordd.trim();
        // return;
        var Venus = await Venu.findAll({
          where: {
            id: {
              $not: requestdata.user_id,
            },
            name: {
              [Op.like]: '%' + keywordd + '%'
            },
            user_type: 0
          }
        });
        const final = [];
        if (Venus && Venus.length > 0) {
          for (var v of Venus) {
            let check = await Suspend.count({
              where: {
                user_id: requestdata.user_id,
                venue_id: v.dataValues.id,
                status: 1
              }
            });
            v.dataValues.suspend = 0;
            if (check) {
              v.dataValues.suspend = 1;
            }

            const cat = await Favourite.findOne({
              where: {
                user_id: requestdata.user_id,
                venue_id: v.dataValues.id,
              }
            })
            if (cat) {
              v.dataValues.is_favourited = 1;
            } else {
              v.dataValues.is_favourited = 0
            }
            final.push(v);
          }
        }
        /*   if (requestdata.type == 1) {
            const objj = {
              user_id : requestdata.user_id,
              keyword : keywordd,
            };
            await VenueSearchKeyword.findOrCreate({
              where: objj, // we search for this
              defaults: objj // if not found then insert this
            });
        } */
        return responseHelper.get(res, final);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async add_order(req, res) {
    // res.send('RETURN ' + typeof  JSON.parse(req.body.items_data))
    const ProductItemsData = JSON.parse(req.body.items_data);
    // res.send('RETURN ' + ProductItemsData[0].id)
    // res.send(JSON.stringify(ProductItemsData))
    try {
      let todayTimestamp = Math.floor(Date.now() / 1000);
      const required = {
        security_key: req.headers.security_key,
        terminal_id: req.body.terminal_id,
        items_data: req.body.items_data,
        tbm_service: req.body.tbm_service,
        //cvv: req.body.cvv,
        user_id: req.body.user_id,
        total: req.body.total,
        venue_id: req.body.venue_id,
        main_category_id: req.body.main_category_id,
        payment_type: req.body.payment_type,
        //sub_category_id : req.body.sub_category_id,              
        createdAt: todayTimestamp,
        table_name: 'venues',
      };
      const non_required = {
        table_number: req.body.table_number,
        transaction_id: req.body.transaction_id == undefined ? 0 : req.body.transaction_id,
        //payment_status: req.body.payment_status == undefined ? 0 : req.body.payment_status,
        pay_id: req.body.pay_id == undefined ? 0 : req.body.pay_id,
        cvv: req.body.cvv == undefined ? 0 : req.body.cvv,
        stripe_token: req.body.stripe_token == undefined ? 0 : req.body.stripe_token,
        //receipt_no: req.body.receipt_no == undefined ? 0 : req.body.receipt_no,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        // code to generate receipt no. 
        var dt = dateTime.create(new Date());
        var formattedDate = dt.format('d-m-y');
        //convert date to date timestamp only excluding the time
        const myDate = formattedDate.split("-");
        var newDate = myDate[1] + "/" + myDate[0] + "/" + myDate[2];
        const new_timestamp = new Date(newDate).getTime() / 1000.0 // excluding time

        const check_terminal = await Venu.findOne({
          attributes: ['device_type', 'device_token'],
          where: {
            terminal_id: requestdata.terminal_id,
          }
        });
        if (check_terminal) {

          if (requestdata.table_number != '') {
            const trmnl = await Terminal.findOne({
              attributes: ['table_number'],
              where: {
                id: requestdata.terminal_id
              }
            });
            if (requestdata.table_number > trmnl.dataValues.table_number) {
              if (trmnl.dataValues.table_number > 0) {
                return responseHelper.post(res, 'No Tables higher than' + trmnl.dataValues.table_number);
              } else {
                return responseHelper.post(res, 'No Table service added yet');
              }
            }
          }
          if (requestdata.payment_type == 0) {
            var usr_name = await Venu.findOne({
              attributes: ['id', 'name', 'email'],
              where: {
                id: requestdata.user_id
              }
            });
            const card_details = await Card.findOne({
              attributes: ['id', 'card_type', 'card_number', 'card_expiry'],
              where: {
                venue_id: requestdata.user_id
              }
            });
            /*  console.log(card_details,"card_details"); */
            if (card_details) {
              //var new_total = parseFloat(requestdata.total) + parseFloat(requestdata.tbm_service);
              // console.log(new_total); return;
              // console.log( 'name  =====>', usr_name.dataValues.name);
              //console.log( 'card =====>', card_details.dataValues.card_expiry); return;
              let expiry_date = card_details.dataValues.card_expiry;
              let expiry_month = expiry_date.split('/');
              //console.log('expiry_month: ', expiry_month[0]);
              // console.log('expiry_year: ', expiry_month[1]); return ;
              var create_payment_json = {
                "intent": "sale",
                "payer": {
                  "payment_method": "credit_card",
                  "funding_instruments": [{
                    "credit_card": {
                      "type": card_details.dataValues.card_type,
                      "number": card_details.dataValues.card_number,
                      "expire_month": expiry_month[0],
                      "expire_year": expiry_month[1],
                      "cvv2": requestdata.cvv,
                      "first_name": usr_name.dataValues.name,
                    }
                  }]
                },
                "transactions": [{
                  "amount": {
                    "total": requestdata.total,
                    //"total": new_total,
                    "currency": "AUD",
                    /* "details": {
                        "subtotal": sub_total,
                        "tax": "1",
                        "shipping": "1"
                    } */
                  },
                  "description": "This is the payment transaction description."
                }]
              };
              await paypal.payment.create(create_payment_json, async function (error, payment) {
                if (error) {
                   console.log(error,"error-==")
                  //  throw error;
                  //console.log(JSON.stringify(error));
                  //  res.send(error); return;
                  //console.log('error ===============>' ,error.response.details[0].issue);return;
                  //  var  m_  = "" error.response.details[0].issue + " "+ error.response.details[0].issue;
                  var m_ = error.response.details[0].issue;
                  if (error.response.details[0].issue == "Value must be numeric." && error.response.details[0].field == 'payer.funding_instruments[0].credit_card.number') {
                    m_ = "Please enter correct card number";
                  }
                  return responseHelper.onError(res, '', m_);
                } else {
                  /*   console.log("Payment Done==========================="); */
                  if (payment) {
                    const transaction = await Transactions.create({
                      user_id: requestdata.user_id,
                      venue_id: requestdata.venue_id,
                      order_id: 0,
                      payment_type: 0,
                      amount: requestdata.total,
                      //amount: new_total,
                      transaction_id: payment.transactions[0].related_resources[0].sale.id,
                      status: payment.transactions[0].related_resources[0].sale.state,
                      pay_id: payment.id,
                    });

                    let notConcludedOrders = await Order.count({
                      where: {
                        terminal_id: requestdata.terminal_id,
                        conclude_status: 0,
                        main_category_id: requestdata.main_category_id,
                        // status : {
                        //     $in: [2, 3, 4]
                        // }
                      }

                    });
                    //
                    //check_concluded_order_group

                    let orderGroup = await Order.findOne({
                      where: {
                        venue_id: requestdata.venue_id,
                        // user_id:requestdata.user_id,
                        main_category_id: requestdata.main_category_id,
                      },
                      attributes: ['id', 'order_group'],
                      /* order:['id','DESC'] */
                      order: [
                        ['id', 'DESC'],
                      ],
                    });

                    if (orderGroup) {
                      if (orderGroup.dataValues.conclude_status == 0) {
                        requestdata.order_group = orderGroup.dataValues.order_group;
                      }
                      else {

                        requestdata.order_group = orderGroup.dataValues.order_group + 1;
                      }
                    }


                    requestdata.order_no = notConcludedOrders + 1;


                    const save = await Order.create(requestdata);
                    if (!save) {
                      throw "Error in Product additon.";
                    }
                    await Order.update({
                      receipt_no: save.dataValues.id + '' + new_timestamp,
                    }, {
                        where: {
                          id: save.dataValues.id
                        }
                      });
                    // console.log(save);
                    requestdata.items_data = JSON.parse(requestdata.items_data);
                    if (requestdata.items_data) {
                      var items_data = [];
                      for (var val of requestdata.items_data) {
                        let v = {};
                        v.orderId = save.dataValues.id;
                        v.userId = requestdata.user_id;
                        v.terminal_id = requestdata.terminal_id;
                        v.productId = val.id;
                        v.instructions = val.instructions;
                        v.price = val.price;
                        v.size = val.size;
                        v.product_name = val.product_name;
                        v.category_id = val.category_id;
                        v.sub_category_id = val.sub_category_id;
                        v.timestamp = todayTimestamp;
                        v.quantity = val.quantity;
                        v.venueId = requestdata.venue_id;
                        items_data.push(v);
                      }
                      // console.log(items_data);
                      if (items_data) {
                        const save_product_categorie = await OrderDetail.bulkCreate(items_data);
                      }
                      requestdata.id = save.dataValues.id;
                    }
                    // console.log(transaction);return;
                    const trans = await Transactions.update({
                      order_id: save.dataValues.id,
                    }, {
                        where: {
                          id: transaction.dataValues.id,
                        }
                      });
                    const venue_detail = await Venu.findOne({
                      attributes: ['device_type', 'device_token'],
                      where: {
                        terminal_id: requestdata.terminal_id,
                      }
                    });
                    const main_cat_name = await MainCategory.findOne({
                      attributes: ['title'],
                      where: {
                        id: requestdata.main_category_id,
                      }
                    });
                    /*  let data = {
                         notification_type: 1,
                         main_category_id: requestdata.main_category_id,
                     }; */
                    const message = {
                      to: venue_detail.dataValues.device_token,
                      collapse_key: '1',
                      /*  notification: {
                           title: 'You have a new order',
                           body: 'You have a new order',
                       }, */
                      data: {
                        title: 'You have a new order',
                        body: 'You have a new order',
                        main_category_id: requestdata.main_category_id,
                        main_category_name: main_cat_name.dataValues.title,
                      },
                      //data: data,
                    };
                    helpers.push_notification(message);
                    const queue = await Order.count({
                      where: {
                        //venue_id: requestdata.venue_id,
                        terminal_id: requestdata.terminal_id,
                        main_category_id: requestdata.main_category_id,
                        createdAt: {
                          $lte: requestdata.createdAt
                        },
                        status: {
                          $not: 3
                        }
                      }
                    });
                    const round = await Order.count({
                      where: {
                        //venue_id: requestdata.venue_id,
                        terminal_id: requestdata.terminal_id,
                        user_id: requestdata.user_id,
                        main_category_id: requestdata.main_category_id,
                        createdAt: {
                          $lte: requestdata.createdAt
                        },
                        //  status :{
                        //    $not : 3
                        //  }
                      }
                    });
                    // console.log(round)  ;
                    requestdata.queue = queue;
                    requestdata.payment = payment;
                    console.log(payment);
                    // generate receipt //
                    const rcpt = await receiptFunction.generate_receipt(save.dataValues.id);
                    // send receipt to email
                    ejs.renderFile("/var/www/html/barmate/views/new_test.ejs", { response: rcpt, date: dateTime }, function (err, data) {
                      if (err) {
                        console.log(err);
                      } else {
                        var mail = {
                          from: '"Barmate" admin@barmate.com',
                          to: usr_name.dataValues.email,
                          subject: 'Order Detail',
                          html: data
                        };
                        helpers.send_mail(mail);
                      }
                    });
                    return responseHelper.post(res, requestdata);
                  } else {
                    return responseHelper.post(res, 'payment failed');
                  }
                }
              });
            } else {
              /*  return responseHelper.post(res, 'card not added, please add card for payment process'); */
              res.json({
                code: 200,
                message: 'card not added, please add card for payment process',
                body: {}
              });
            }
          } else if(requestdata.payment_type == 1) {
            var usr_name = await Venu.findOne({
              attributes: ['id', 'name', 'email'],
              where: {
                id: requestdata.user_id
              }
            });

            // let token = await stripe.tokens.create(
            //   {
            //     card: {
            //       number: '4242424242424242',
            //       exp_month: 4,
            //       exp_year: 2021,
            //       cvc: '314',
            //     }
            //   }
            // );

            /**
             * START
             * Add order to integrations
             */
            let venueIntegration = await VenueIntegrationModel.find({
              where: {
                venue_id: requestdata.venue_id
              }
            })
            if(venueIntegration) {
              if(venueIntegration.site === 'kounta') {
                // res.send('TEST')
                await KountaManager.refreshAccessToken(venueIntegration)
                const company = await KountaManager.getCompany(venueIntegration)
                // res.send('company ' + company.id)
                const sites = await KountaManager.getSites(venueIntegration, company)
                // res.send('site ' + sites[0].site_id)
                await KountaManager.createOrder(venueIntegration, company, sites[0], ProductItemsData)
                // res.send('order ')
                // res.send('kounta integration')
              } else if(venueIntegration.site === 'swift') {
                let apiKey = await SwiftManager.getApiKey(venueIntegration)
                await SwiftManager.createOrder(apiKey, ProductItemsData)
                // res.send('swift integration')
              } else {
                res.send('unknown integration')
              }
            } else {
              res.send('does not have venue integration')
            }
            // // res.send('ROBERT')
            // let venueIntegration = await KountaManager.getVenueIntegration(requestdata.venue_id)
            // await KountaManager.refreshAccessToken(venueIntegration)
            //
            // // res.send('ROBERT')
            // // res.send(JSON.stringify(venueIntegration))
            //
            // res.send('ROBERT')

            /**
             * END
             * Add order to integrations
             */

            await stripe.customers.create(
              {
                source: requestdata.stripe_token,
                email: usr_name.dataValues.email,
                name: usr_name.dataValues.name
              },
              async function(err, customer) {
                // asynchronously called

                if(err) {
                  // throw err;
                  return responseHelper.Error(res, {}, (err.raw.message)?err.raw.message:"Stripe customer error");
                } else {
                    let venueAccountId = await Venu.findOne({
                      where: {
                        id: requestdata.venue_id
                      }
                    });

                    venueAccountId = venueAccountId.toJSON();
                    venueAccountId = venueAccountId.account_id;

                    let num = requestdata.total - 0.30;
                    num = parseFloat(num);
                    num = num - (0.0175 * requestdata.total);
                    num = parseFloat(num);
                    num = num - (0.0325 * num);
                    num = num.toFixed(2);
                    num = parseFloat(num) * 100;
                    num = num.toFixed(0);
                    num = parseInt(num);

                    let amount_to_be_paid = requestdata.total;

                    amount_to_be_paid = (amount_to_be_paid * 100).toFixed(0);
                    amount_to_be_paid = parseInt(amount_to_be_paid);

                  await stripe.charges.create(
                    {
                      amount: Math.round(amount_to_be_paid),
                      currency: 'aud',
                      customer: customer.id,
                      transfer_data: {
                        amount: num,
                        destination: venueAccountId
                      }
                    },
                    async function(err, charge) {
                      // asynchronously called
                      if(err) {
                        // throw err;
                        return responseHelper.Error(res, {}, (err.raw.message)?err.raw.message:"Stripe charge error");
                      } else {
                        let charge_id = charge.id;
                        let status = charge.status;
                        let txn_id = charge.balance_transaction;
                        let transfer_id = charge.transfer;

                         const transaction = await Transactions.create({
                          user_id: requestdata.user_id,
                          venue_id: requestdata.venue_id,
                          order_id: 0,
                          amount: requestdata.total,
                          //amount: new_total,
                          transaction_id: txn_id,
                          payment_type: 1,
                          status: status,
                          // pay_id: requestdata.pay_id,
                          charge_id: charge_id,
                          stripe_transfer_id: transfer_id,
                          payout: 1
                        });

                         let notConcludedOrders = await Order.count({
                            where: {
                              terminal_id: requestdata.terminal_id,
                              conclude_status: 0,
                              main_category_id: requestdata.main_category_id,
                              // status : {
                              //     $in: [2, 3, 4]
                              // }
                            }

                          });

                         //check_concluded_order_group

                          let orderGroup = await Order.findOne({
                            where: {
                              venue_id: requestdata.venue_id,
                              // user_id:requestdata.user_id,
                              main_category_id: requestdata.main_category_id,

                            },
                            attributes: ['id', 'order_group', 'conclude_status'],
                            order: [
                              ['id', 'DESC']
                            ],
                          });


                          if (orderGroup) {
                            if (orderGroup.dataValues.conclude_status == 0) {
                              requestdata.order_group = orderGroup.dataValues.order_group;
                            }
                            else {

                              requestdata.order_group = orderGroup.dataValues.order_group + 1;
                            }
                          }
                          requestdata.order_no = notConcludedOrders + 1;

                          const save = await Order.create(requestdata);
                          if (!save) {
                            throw "Error in Product additon.";
                          }
                          await Order.update({
                            receipt_no: save.dataValues.id + '' + new_timestamp,
                          }, {
                              where: {
                                id: save.dataValues.id
                              }
                            });
                          // console.log(save);
                          requestdata.items_data = JSON.parse(requestdata.items_data);
                          if (requestdata.items_data) {
                            var items_data = [];
                            for (var val of requestdata.items_data) {
                              let v = {};
                              v.orderId = save.dataValues.id;
                              v.userId = requestdata.user_id;
                              v.terminal_id = requestdata.terminal_id;
                              v.productId = val.id;
                              v.instructions = val.instructions;
                              v.price = val.price;
                              v.size = val.size;
                              v.product_name = val.product_name;
                              v.category_id = val.category_id;
                              v.sub_category_id = val.sub_category_id;
                              v.timestamp = todayTimestamp;
                              v.quantity = val.quantity;
                              v.venueId = requestdata.venue_id;
                              items_data.push(v);
                            }
                            // console.log(items_data);
                            if (items_data) {
                              const save_product_categorie = await OrderDetail.bulkCreate(items_data);
                            }
                            requestdata.id = save.dataValues.id;
                          }
                          // console.log(transaction);return;
                          const trans = await Transactions.update({
                            order_id: save.dataValues.id,
                          }, {
                              where: {
                                id: transaction.dataValues.id,
                              }
                            });
                          const venue_detail = await Venu.findOne({
                            attributes: ['device_type', 'device_token'],
                            where: {
                              terminal_id: requestdata.terminal_id,
                            }
                          });
                          const main_cat_name = await MainCategory.findOne({
                            attributes: ['title'],
                            where: {
                              id: requestdata.main_category_id,
                            }
                          });
                          const message = {
                            to: venue_detail.dataValues.device_token,
                            collapse_key: '1',
                            /*  notification: {
                                 title: 'You have a new order',
                                 body: 'You have a new order',
                             }, */
                            data: {
                              title: 'You have a new order',
                              body: 'You have a new order',
                              main_category_id: requestdata.main_category_id,
                              main_category_name: main_cat_name.dataValues.title,
                              device_type:venue_detail.dataValues.device_type
                            },
                            /*  data: {
                                 notification_type: 1
                             }, */
                          };
                          // if(venue_detail.dataValues.device_type == 0){
                          //   message.notification = {
                          //     title: 'You have a new order',
                          //     body: 'You have a new order',
                          //   };
                          // }
                          helpers.push_notification(message);

                          /////////////////////////// PAYMENT NOTIFICATION TO VENUE ////////////////////////////

                       //    const message_for_payment = {
			                    //   to: venue_detail.dataValues.device_token,
			                    //   collapse_key: '1',
			                    //   data: {
			                    //     notification_type: 2,
			                    //     title: 'You have received a payment of AUD ' + num/100 + ' ',
			                    //     body: 'You have received a payment of AUD ' + num/100 + ' ',
			                    //     device_type:venue_detail.dataValues.device_type
			                    //   },
			                    // };
			                    
			                    // helpers.push_notification(message_for_payment);

			                    ////////////////////////////////////////////////////////////////////////////////////////

                          const queue = await Order.count({
                            where: {
                              //venue_id: requestdata.venue_id,
                              terminal_id: requestdata.terminal_id,
                              main_category_id: requestdata.main_category_id,
                              createdAt: {
                                $lte: requestdata.createdAt
                              },
                              status: {
                                $not: 3
                              }
                            }
                          });
                          const round = await Order.count({
                            where: {
                              //venue_id: requestdata.venue_id,
                              terminal_id: requestdata.terminal_id,
                              user_id: requestdata.user_id,
                              main_category_id: requestdata.main_category_id,
                              createdAt: {
                                $lte: requestdata.createdAt
                              },
                              //  status :{
                              //    $not : 3
                              //  }
                            }
                          });
                          // console.log(round)  ;
                          requestdata.queue = queue;
                          //requestdata.payment = payment;
                          //console.log(payment);
                          // generate receipt //
                          const rcpt = await receiptFunction.generate_receipt(save.dataValues.id);
                          // send receipt to email
                          ejs.renderFile("/var/www/html/barmate/views/new_test.ejs", { response: rcpt, date: dateTime }, function (err, data) {
                            if (err) {
                              console.log(err);
                            } else {
                              var mail = {
                                from: '"Barmate" admin@barmate.com',
                                to: usr_name.dataValues.email,
                                subject: 'Order Detail',
                                html: data
                              };
                              helpers.send_mail(mail);
                            }
                          });
                          return responseHelper.post(res, requestdata);
                      }
                    }
                  );
                }
              }
            );

            // /**
            //  * START
            //  * Add order to integrations
            //  */
            // let venueIntegration = await VenueIntegrationModel.find({
            //   where: {
            //     venue_id: requestdata.venue_id
            //   }
            // })
            // if(venueIntegration) {
            //   if(venueIntegration.site === 'kounta') {
            //     // res.send('TEST')
            //     res.send(await KountaManager.refreshAccessToken(venueIntegration))
            //     res.send('TEST')
            //     const company = await KountaManager.getCompany(venueIntegration)
            //     res.send('company ' + company.id)
            //     // await KountaManager.createOrder(venueIntegration, company)
            //     res.send('kounta integration')
            //   } else if(venueIntegration.site === 'swift') {
            //     res.send('swift integration')
            //   } else {
            //     res.send('unknown integration')
            //   }
            // } else {
            //   res.send('does not have venue integration')
            // }
            // // // res.send('ROBERT')
            // // let venueIntegration = await KountaManager.getVenueIntegration(requestdata.venue_id)
            // // await KountaManager.refreshAccessToken(venueIntegration)
            // //
            // // // res.send('ROBERT')
            // // // res.send(JSON.stringify(venueIntegration))
            // //
            // // res.send('ROBERT')
            //
            // /**
            //  * END
            //  * Add order to integrations
            //  */

          } else {
            const transaction = await Transactions.create({
              user_id: requestdata.user_id,
              venue_id: requestdata.venue_id,
              order_id: 0,
              amount: requestdata.total,
              //amount: new_total,
              transaction_id: 'apple_pay_txn_id',
              payment_type: 2,
              status: 'apple_pay_status',
              // pay_id: requestdata.pay_id,
              charge_id: '',
              stripe_transfer_id: '',
              payout: 1
            });

            let notConcludedOrders = await Order.count({
              where: {
                terminal_id: requestdata.terminal_id,
                conclude_status: 0,
                main_category_id: requestdata.main_category_id,
                // status : {
                //     $in: [2, 3, 4]
                // }
              }

            });

            let orderGroup = await Order.findOne({
              where: {
                venue_id: requestdata.venue_id,
                // user_id:requestdata.user_id,
                main_category_id: requestdata.main_category_id,

              },
              attributes: ['id', 'order_group', 'conclude_status'],
              order: [
                ['id', 'DESC']
              ],
            });

            if (orderGroup) {
              if (orderGroup.dataValues.conclude_status == 0) {
                requestdata.order_group = orderGroup.dataValues.order_group;
              }
              else {

                requestdata.order_group = orderGroup.dataValues.order_group + 1;
              }
            }
            requestdata.order_no = notConcludedOrders + 1;

            const save = await Order.create(requestdata);
            if (!save) {
              throw "Error in Product additon.";
            }
            await Order.update({
              receipt_no: save.dataValues.id + '' + new_timestamp,
            }, {
                where: {
                  id: save.dataValues.id
                }
              });
              requestdata.items_data = JSON.parse(requestdata.items_data);

              if (requestdata.items_data) {
                var items_data = [];
                for (var val of requestdata.items_data) {
                  let v = {};
                  v.orderId = save.dataValues.id;
                  v.userId = requestdata.user_id;
                  v.terminal_id = requestdata.terminal_id;
                  v.productId = val.id;
                  v.instructions = val.instructions;
                  v.price = val.price;
                  v.size = val.size;
                  v.product_name = val.product_name;
                  v.category_id = val.category_id;
                  v.sub_category_id = val.sub_category_id;
                  v.timestamp = todayTimestamp;
                  v.quantity = val.quantity;
                  v.venueId = requestdata.venue_id;
                  items_data.push(v);
                }
                // console.log(items_data);
                if (items_data) {
                  const save_product_categorie = await OrderDetail.bulkCreate(items_data);
                }
                requestdata.id = save.dataValues.id;
              }

              const trans = await Transactions.update({
                order_id: save.dataValues.id,
              }, {
                  where: {
                    id: transaction.dataValues.id,
                  }
                });
              const venue_detail = await Venu.findOne({
                attributes: ['device_type', 'device_token'],
                where: {
                  terminal_id: requestdata.terminal_id,
                }
              });
              const main_cat_name = await MainCategory.findOne({
                attributes: ['title'],
                where: {
                  id: requestdata.main_category_id,
                }
              });

              const message = {
                to: venue_detail.dataValues.device_token,
                collapse_key: '1',
                /*  notification: {
                     title: 'You have a new order',
                     body: 'You have a new order',
                 }, */
                data: {
                  title: 'You have a new order',
                  body: 'You have a new order',
                  main_category_id: requestdata.main_category_id,
                  main_category_name: main_cat_name.dataValues.title,
                  device_type:venue_detail.dataValues.device_type
                },
                /*  data: {
                     notification_type: 1
                 }, */
              };

              helpers.push_notification(message);

              const queue = await Order.count({
                where: {
                  //venue_id: requestdata.venue_id,
                  terminal_id: requestdata.terminal_id,
                  main_category_id: requestdata.main_category_id,
                  createdAt: {
                    $lte: requestdata.createdAt
                  },
                  status: {
                    $not: 3
                  }
                }
              });
              const round = await Order.count({
                where: {
                  //venue_id: requestdata.venue_id,
                  terminal_id: requestdata.terminal_id,
                  user_id: requestdata.user_id,
                  main_category_id: requestdata.main_category_id,
                  createdAt: {
                    $lte: requestdata.createdAt
                  },
                  //  status :{
                  //    $not : 3
                  //  }
                }
              });

              requestdata.queue = queue;

              const rcpt = await receiptFunction.generate_receipt(save.dataValues.id);

              ejs.renderFile("/var/www/html/barmate/views/new_test.ejs", { response: rcpt, date: dateTime }, function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  var mail = {
                    from: '"Barmate" admin@barmate.com',
                    to: usr_name.dataValues.email,
                    subject: 'Order Detail',
                    html: data
                  };
                  helpers.send_mail(mail);
                }
              });
              return responseHelper.post(res, requestdata);
          }
        } else {
          return responseHelper.Error(res, {}, 'No terminal to accept order');
        }
      }
      // res.setHeader('Content-Type', 'application/json');
      // res.send(JSON.stringify({code: '200', message: 'Order successfully placed.'}))
    } catch (err) {

      return responseHelper.onError(res, err, err);
    }
  }

  async get_payment_intent_id(req,res){
    try{
     const required = {
      // security_key: req.headers.security_key,
       amount: req.body.amount,
     };
     const non_required = {};
     let requestdata = await helpers.vaildObject(required, non_required, res);

     requestdata.amount = (requestdata.amount * 100).toFixed(0);
     
     console.log(requestdata,"requestdata")

     const paymentIntent = await stripe.paymentIntents.create({
        amount: requestdata.amount,
        currency: 'aud',
      });

      if(paymentIntent.id) {
        return responseHelper.post(res, paymentIntent);
      } else {
        return responseHelper.Error(res, {}, 'Error...Payment intent not created');
      }

    }catch(err){
      throw err
    }
 }

  async client_token(req,res){
    gateway.clientToken.generate({}, function (err, response) {
      res.send(response.clientToken);
    });
  }

  async createPayment (req,res){
    try{
      var profile_name = Math.random().toString(36).substring(7);

var create_web_profile_json = {
    "name": profile_name,
    "presentation": {
        "brand_name": "Best Brand",
        "logo_image": "https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg",
        "locale_code": "US"
    },
    "input_fields": {
        "allow_note": true,
        "no_shipping": 1,
        "address_override": 1
    },
    "flow_config": {
        "landing_page_type": "billing",
        "bank_txn_pending_url": "http://www.yeowza.com"
    }
};
paypal.webProfile.create(create_web_profile_json, function (error, web_profile) {
  if (error) {
      throw error;
  } else {
      console.log("Create web_profile Response");
      console.log(web_profile);
  }
});
return false
      request.post(PAYPAL_API + '/v1/payments/payment',
      {
        auth:
        {
          user: CLIENT,
          pass: SECRET
        },
        body:
        {
          intent: 'sale',
          payer:
          {
            payment_method: 'CREDIT_CARD',
            funding_instruments: [{
              "credit_card": {
                "type": 'visa',
                "number": 4417119669820331,
                "expire_month": 12,
                "expire_year": 2022,
                "cvv2": 454,
                "first_name": 'asd',
              }
            }]
          },
          transactions: [
          {
            amount:
            {
              total: '7.99',
              currency: 'USD'
            }
          }],
          redirect_urls:
          {
            return_url: 'https://example.com',
            cancel_url: 'https://example.com'
          }
        },
        json: true
      }, function(err, response)
      {
        if (err)
        {
          console.error(err);
          return res.sendStatus(500);
        }
        // console.log(response.body.payer.funding_instruments);
        var paymentID = req.body.paymentID;
         var payerID = req.body.payerID;
        // 3. Return the payment ID to the client
        request.post(PAYPAL_API + '/v1/payments/payment/' + paymentID +
      '/execute',
      {
        auth:
        {
          user: CLIENT,
          pass: SECRET
        },
        body:
        {
          payer_id: response.body.id,
          transactions: [
          {
            amount:
            {
              total: '10.99',
              currency: 'USD'
            }
          }]
        },
        json: true
      },
      function(err, response)
      {
        if (err)
        {
          console.error(err);
          return res.sendStatus(500);
        }
        // 4. Return a success response to the client
        res.json(
        {
          status: 'success'
        });
      });
      });

    }catch(err){
      throw err
    }
  }

  async client_token(req,res){
    gateway.clientToken.generate({}, function (err, response) {
      res.send(response.clientToken);
    });
  }

  async checkout(req, res) {
    try {
      let todayTimestamp = Math.floor(Date.now() / 1000);
      const required = {
        // security_key: req.headers.security_key,
        payment_method_nonce: req.body.payment_method_nonce,
        deviceDataFromTheClient: req.body.deviceDataFromTheClient,
        terminal_id: req.body.terminal_id,
        items_data: req.body.items_data,
        tbm_service: req.body.tbm_service,
        //cvv: req.body.cvv,
        user_id: req.body.user_id,
        total: req.body.total,
        venue_id: req.body.venue_id,
        main_category_id: req.body.main_category_id,
        payment_type: req.body.payment_type,
        //sub_category_id : req.body.sub_category_id,              
        createdAt: todayTimestamp,
        table_name: 'venues',
      };
      const non_required = {
        table_number: req.body.table_number,
        transaction_id: req.body.transaction_id == undefined ? 0 : req.body.transaction_id,
        //payment_status: req.body.payment_status == undefined ? 0 : req.body.payment_status,
        pay_id: req.body.pay_id == undefined ? 0 : req.body.pay_id,
        cvv: req.body.cvv == undefined ? 0 : req.body.cvv,
        //receipt_no: req.body.receipt_no == undefined ? 0 : req.body.receipt_no,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      requestdata = req.body;
      console.log('=================================>>>',requestdata);
      if (requestdata != "") {

        // code to generate receipt no. 
        var dt = dateTime.create(new Date());
        var formattedDate = dt.format('d-m-y');
        //convert date to date timestamp only excluding the time
        const myDate = formattedDate.split("-");
        var newDate = myDate[1] + "/" + myDate[0] + "/" + myDate[2];
        const new_timestamp = new Date(newDate).getTime() / 1000.0 // excluding time
        var nonceFromTheClient = req.body.payment_method_nonce;
        var deviceDataFromTheClient = req.body.deviceDataFromTheClient;

        const check_terminal = await Venu.findOne({
          attributes: ['device_type', 'device_token'],
          where: {
            terminal_id: requestdata.terminal_id,
          }
        });
        if (check_terminal) {
          if (requestdata.table_number != '') {
            const trmnl = await Terminal.findOne({
              attributes: ['table_number'],
              where: {
                id: requestdata.terminal_id
              }
            });
            if (requestdata.table_number > trmnl.dataValues.table_number) {
              if (trmnl.dataValues.table_number > 0) {
                return responseHelper.post(res, 'No Tables higher than' + trmnl.dataValues.table_number);
              } else {
                return responseHelper.post(res, 'No Table service added yet');
              }
            }
          }
          var usr_name = await Venu.findOne({
            attributes: ['id', 'name', 'email'],
            where: {
              id: requestdata.user_id
            }
          });
          gateway.transaction.sale({
              amount: "1.00",
              paymentMethodNonce: nonceFromTheClient,
              deviceData: deviceDataFromTheClient,
              options: {
                submitForSettlement: true
              }
            },async function (err, result) {
                if(err){
                  console.log(err);
                  return responseHelper.Error(res, {}, err);
                }
                else{
                  console.log(result);
                  if(result.success = 'false'){ // when the payment failed
                    console.log(result);
                    return responseHelper.Error(res, {}, result.message);
                  }
                  if(result.success = 'true'){  // when the payment processed successfully
                    const transaction = await Transactions.create({
                      user_id: requestdata.user_id,
                      venue_id: requestdata.venue_id,
                      order_id: 0,
                      payment_type: 0,
                      amount: requestdata.total,
                      transaction_id: payment.transactions[0].related_resources[0].sale.id,
                      status: payment.transactions[0].related_resources[0].sale.state,
                      pay_id: payment.id,
                    });
                    let notConcludedOrders = await Order.count({
                      where: {
                        terminal_id: requestdata.terminal_id,
                        conclude_status: 0,
                        main_category_id: requestdata.main_category_id,
                      }
                    });
                    //check_concluded_order_group
                    let orderGroup = await Order.findOne({
                      where: {
                        venue_id: requestdata.venue_id,
                        // user_id:requestdata.user_id,
                        main_category_id: requestdata.main_category_id,
                      },
                      attributes: ['id', 'order_group'],
                      /* order:['id','DESC'] */
                      order: [
                        ['id', 'DESC'],
                      ],
                    });

                    if (orderGroup) {
                      if (orderGroup.dataValues.conclude_status == 0) {
                        requestdata.order_group = orderGroup.dataValues.order_group;
                      }
                      else {
                        requestdata.order_group = orderGroup.dataValues.order_group + 1;
                      }
                    }
                    requestdata.order_no = notConcludedOrders + 1;
                  }
                }
          });
          // Use payment method nonce here

        }else{
          return responseHelper.Error(res, {}, 'No terminal to accept order');
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  // async test_receipt(req,res){
  //     try{
  //     const rcpt = await receiptFunction.generate_receipt(save.dataValues.id);

  //      res.render('new_test',{
  //         title: "players",
  //         response: rcpt,
  //         date: dateTime
  //     });
  // }
  // catch(e){
  //     console.log(e);
  // }

  // }
  async current_order_listing_backup(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 
        // var to_time= 86400 +'+'+ t_t;
        var to_time = parseInt(86400) + parseInt(t_t);
        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.createdAt = {
          $lte: to_time,
          $gte: t_t
        };

        var Orders = await Order.findAll({
          include: [{
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          order: [
            ['id']
          ],
          where: conditons
        });
        // Math.floor(Date.now() / 1000),

        // console.log(t_t/1000);

        // return;
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async venu_order_listing_by_date(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        date_timestamp: req.query.date_timestamp,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};
        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        // conditons.conclude_status = 1;
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = requestdata.date_timestamp;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }
        var Orders = await Order.findAll({
          attributes: [
            [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date'],
            [db.sequelize.fn('count', 'date'), 'order_count'], 'createdAt', 'user_id'
          ],
          // include :[{
          //   model : User,
          //       as: 'userDetails',
          //       attributes :[
          //         'id','name','image'
          //       ]
          //     }
          // ],
          where: conditons,
          group: ['date'],
          order: [
            ['createdAt', 'DESC']
          ],
        });
        // var Orders = await db.sequelize.query("SELECT  DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y') AS 'date_formatted' from orders  GROUP BY date_formatted having date_formatted = '28-02-2019'");


        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async history(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        history_type: req.query.history_type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        date_timestamp: req.query.date_timestamp,
        terminal_id: req.query.terminal_id,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        ///////// for all 
        if (requestdata.history_type == 1) {
          var conditons = {};
          conditons.venue_id = requestdata.venue_id;
          conditons.main_category_id = requestdata.main_category_id;
          conditons.conclude_status = 1;
          conditons.status = {
            $in: [2, 3, 4]
          };
          if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
            var t_t = requestdata.date_timestamp;
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.createdAt = {
              $lte: to_time,
              $gte: t_t
            };
          }
          var Orders = await Order.findAll({
            attributes: [
              // [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'start_date'],
              // [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(Max(`createdAt`)), '%d-%m-%Y'))"), 'concluded_date'],
              [db.sequelize.literal("(SELECT `createdAt`)"), 'start_date'],
              [db.sequelize.literal("(SELECT Max(`createdAt`))"), 'concluded_date'],
              [db.sequelize.fn('count', 'date'), 'order_count'], 'createdAt', 'user_id'
            ],
            where: conditons,
            group: ['order_group'],
            order: [
              ['createdAt', 'DESC']
            ],
          });
          return responseHelper.get(res, Orders);
        }
        ///////// for terminal wise ///////////
        else {

          var conditons = {};
          conditons.venue_id = requestdata.venue_id;
          conditons.terminal_id = requestdata.terminal_id;
          conditons.main_category_id = requestdata.main_category_id;
          conditons.conclude_status = 1;
          conditons.status = {
            $in: [2, 3, 4]
          };
          if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
            var t_t = requestdata.date_timestamp;
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.createdAt = {
              $lte: to_time,
              $gte: t_t
            };
          }

          console.log(conditons, '=======>conditions');

          var Orders = await Order.findAll({
            attributes: [
              // [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date'],
              [db.sequelize.literal("(SELECT `createdAt`)"), 'start_date'],
              [db.sequelize.literal("(SELECT Max(`createdAt`))"), 'concluded_date'],
              [db.sequelize.fn('count', 'date'), 'order_count'], 'createdAt', 'user_id'
            ],
            where: conditons,
            group: ['order_group'],
            order: [
              ['createdAt', 'DESC']
            ],
          });
          return responseHelper.get(res, Orders);

        }



      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async past_order_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 
        // var to_time= 86400 +'+'+t_t;
        var to_time = parseInt(86400) + parseInt(t_t);

        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = 4;
        conditons.conclude_status = 0;
        conditons.createdAt = {
          $lte: Math.floor(Date.now() / 1000),
        };
        var Orders = await Order.findAll({
          include: [{
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          order: [
            ['id']
          ],
          where: conditons
        });
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async customer_listing_by_name(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        q: req.query.q,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};
        var user = {};
        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = 4;
        if (requestdata.q) {
          user.name = {
            [Op.like]: '%' + requestdata.q + '%'
          };
        }
        var Orders = await Order.findAll({
          // include :[{

          //   model : User,
          //       as: 'userDetails',
          //       attributes :[
          //         'id','name','image'
          //       ]
          //     }
          // ],
          attributes: ['user_id'],
          group: ['user_id'],
          order: [
            ['id']
          ],
          where: conditons
        });
        let user_ids = [];
        if (Orders && Orders.length > 0) {
          for (var val of Orders) {
            user_ids.push(val.dataValues.user_id)
          }
        }

        // console.log(Orders);
        user.id = { $in: user_ids };
        var Users = await User.findAll({
          attributes: [
            'id', 'name', 'image'
          ],
          where: user
        })
        return responseHelper.get(res, Users);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async customer_listing_for_particular_date(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        date_timestamp: req.query.date_timestamp,
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};
        var user = {};
        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = 4;
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = requestdata.date_timestamp;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }

        var Orders = await Order.findAll({
          attributes: ['user_id'],
          group: ['user_id'],
          order: [
            ['id']
          ],
          where: conditons
        });
        let user_ids = [];
        if (Orders && Orders.length > 0) {
          for (var val of Orders) {
            user_ids.push(val.dataValues.user_id)
          }
        }

        // console.log(Orders);
        user.id = { $in: user_ids };
        var Users = await User.findAll({
          attributes: [
            'id', 'name', 'image'
          ],
          where: user
        })
        return responseHelper.get(res, Users);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async customer_orders(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        user_id: req.query.user_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};
        conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.user_id = requestdata.user_id;
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = requestdata.date_timestamp;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }
        var Orders = await Order.findAll({
          attributes: [
            [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date'],
            [db.sequelize.fn('count', 'date'), 'order_count'], 'createdAt', 'user_id'
          ],
          where: conditons,
          group: ['date'],
          order: [
            ['createdAt', 'DESC']
          ],
        });
        // var Orders = await db.sequelize.query("SELECT  DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y') AS 'date_formatted' from orders  GROUP BY date_formatted having date_formatted = '28-02-2019'");


        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async customer_order_detail(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
        date_timestamp: req.query.date_timestamp,
        main_category_id: req.query.main_category_id,
        user_id: req.query.user_id,
        type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        if (requestdata.type == 1) { // for today customers
          //var conditons = {};
          let conditons = {};
          conditons.venue_id = requestdata.venue_id;
          // conditons.id=requestdata.order_id;
          conditons.user_id = requestdata.user_id;
          conditons.main_category_id = requestdata.main_category_id;
          conditons.conclude_status = 0
          if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
            var t_t = parseInt(requestdata.date_timestamp);
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.createdAt = {
              $lte: to_time,
              $gte: t_t
            };
          }
          let Orders = await Order.findAll({
            include: [{
              model: OrderDetail,
              attributes: ['quantity', 'price', 'instructions', 'size', 'product_name'],
              include: {
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],

              }
            },],
            where: conditons,
            order: [
              ['id', 'ASC'],
              [db.sequelize.col('`orderDetails->product`.`name`'), 'ASC'],

            ],
          });
          /* delete conditons.createdAt;
          conditons.timestamp = {
              $lte: to_time,
              $gte: t_t
          }; */
          let final = {};
          if (Orders) {
            final.rounds = Orders;
            //var order_ids = [];
            let order_ids = [];
            for ( /* var order of Orders */ let order of Orders) {
              let check = await Suspend.count({
                where: {
                  user_id: requestdata.user_id,
                  venue_id: requestdata.venue_id,
                  status: 1
                }
              });
              if (check) {
                order.dataValues.suspend = 1;
              } else {
                order.dataValues.suspend = 0;
              }
              order_ids.push(order.dataValues.id);
            }
            let quantities = await OrderDetail.findAll({
              attributes: ['size', 'product_name', 'price',
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total'],
                [db.sequelize.literal(" (sum(`orderDetails`.`price` * `orderDetails`.`quantity`))"), 'total_price']
              ],
              include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }],
              group: ['product_id'],
              where: {
                order_id: {
                  $in: order_ids
                }
              },
            });
            final.quantities = quantities;
          }
          return responseHelper.get(res, final);
        } else { // for all customers
          //var conditons = {};
          let conditons = {};
          conditons.venue_id = requestdata.venue_id;
          // conditons.id=requestdata.order_id;
          conditons.user_id = requestdata.user_id;
          conditons.main_category_id = requestdata.main_category_id;
          //conditons.conclude_status = 0
          if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
            var t_t = parseInt(requestdata.date_timestamp);
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.createdAt = {
              $lte: to_time,
              $gte: t_t
            };
          }
          let Orders = await Order.findAll({
            include: [{
              model: OrderDetail,
              attributes: ['quantity', 'price', 'size', 'product_name'],
              include: {
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }
            },],

            order: [
              ['id', 'ASC'],
              [db.sequelize.col('`orderDetails->product`.`name`'), 'ASC'],
            ],
            where: conditons,

          });
          /*  delete conditons.createdAt;
           conditons.timestamp = {
               $lte: to_time,
               $gte: t_t
           }; */
          let final = {};
          if (Orders) {
            final.rounds = Orders;
            // var order_ids = [];
            let order_ids = [];
            for ( /* var order of Orders */ let order of Orders) {
              let check = await Suspend.count({
                where: {
                  user_id: requestdata.user_id,
                  venue_id: requestdata.venue_id,
                  status: 1
                }
              });
              if (check) {
                order.dataValues.suspend = 1;
              } else {
                order.dataValues.suspend = 0;
              }
              order_ids.push(order.dataValues.id);
            }
            let quantities = await OrderDetail.findAll({
              attributes: ['size', 'product_name', 'price',
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total'],
                [db.sequelize.literal(" (sum(`orderDetails`.`price` * `orderDetails`.`quantity`))"), 'total_price']
              ],
              include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }],
              group: ['product_id'],
              where: {
                order_id: {
                  $in: order_ids
                }
              }
            });
            final.quantities = quantities;
          }
          return responseHelper.get(res, final);
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async today_trade(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,

        trade_type: req.query.trade_type, // 1= for all terminals 0 = terminal wise
        type: req.query.type, // 0 = today trade , 1 = history
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        timestamp: req.query.timestamp == undefined ? 0 : req.query.timestamp,
        concluded_date: req.query.concluded_date == undefined ? 0 : req.query.concluded_date,
        terminal_id: req.query.terminal_id,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        ///// for all terminals
        if (requestdata.trade_type == 1) {

          // console.log('here'); return

          if (requestdata.type == 0) { // for today trade
            var conditons = {};
            var currentDate = new Date();
            var date = currentDate.getDate();
            var month = currentDate.getMonth();
            var year = currentDate.getFullYear();
            var monthDateYear = (month + 1) + "-" + date + "-" + year;
            var t = new Date(monthDateYear);
            var t_t = (t.getTime()) / 1000;
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.venue_id = requestdata.venue_id;
            conditons.main_category_id = requestdata.main_category_id;
            conditons.conclude_status = 0;
            conditons.status = {
              $in: [2, 3, 4]
            };
            /*  conditons.createdAt = {
                 $lte: to_time,
                 $gte: t_t
             }; */
            var get_Ordersids = await Order.findAll({
              attributes: ['id'],
              where: conditons
            });
            if (get_Ordersids) {
              var order_ids = [];
              for (var order of get_Ordersids) {
                order_ids.push(order.dataValues.id);
              }
              conditons = {};
              conditons.order_id = { $in: order_ids };
            }
            var total = await OrderDetail.findAll({
              attributes: [
                [Sequelize.fn("min", Sequelize.col('orderDetails.timestamp')), 'start_date'],
                [Sequelize.fn("max", Sequelize.col('orderDetails.timestamp')), 'end_date'],
                [db.sequelize.fn('sum', db.sequelize.col('quantity')), 'total_product'],
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`*`orderDetails`.`price` ))"), 'total_amount']
              ],
              where: conditons
            });
            var categoies = await OrderDetail.findAll({
              attributes: ['sub_category_id', 'category_id', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
              include: [{
                model: Subcat,
                attributes: ['name']
              },
              {
                model: Categories,
                attributes: ['name', 'image']
              }
              ],
              where: conditons,
              /*  group: [db.sequelize.col('`category`.`name`'),db.sequelize.col('`subcategory`.`name`')],  */
              group: ['category_id', 'sub_category_id'],
            });
            var full_final = {};
            if (categoies && categoies.length > 0) {
              var final = [];
              full_final.total = total;
              for (var value of categoies) {
                // console.log(value);
                conditons.sub_category_id = value.dataValues.sub_category_id;
                // conditons.category_id=value.dataValues.category_id;
                var products = await OrderDetail.findAll({
                  attributes: ['product_id', 'price', 'size', 'product_name', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
                  // order : [['id']],
                  group: ['product_id'],
                  include: [{
                    model: Product,
                    attributes: ['name', 'description', 'quantity', 'price'],
                  }],
                  where: conditons,
                  order: [
                    [Product, 'name', 'ASC'],
                    [Product, 'quantity', 'ASC'],
                  ],
                });
                // value.dataValues.cat_name=value.dataValues.category.name;
                value.dataValues.Product = products;
                final.push(value);
              }
              full_final.data = final;
              full_final.orders_id = get_Ordersids;
            }
            return responseHelper.get(res, full_final);
          } else { // all terminal history
            var conditons = {};
            var t_t = requestdata.timestamp;
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.venue_id = requestdata.venue_id;
            conditons.main_category_id = requestdata.main_category_id;
            conditons.conclude_status = 1;
            conditons.status = {
              $in: [2, 3, 4]
            };
            conditons.createdAt = {
              $lte: requestdata.concluded_date,
              $gte: t_t
            };
            // console.log(conditons, '=========>conditons_order_ids ------->all');return;
            var get_Ordersids = await Order.findAll({
              attributes: ['id'],
              where: conditons
            });
            // return;
            // console.log(get_Ordersids);return;
            if (get_Ordersids) {
              var order_ids = [];
              for (var order of get_Ordersids) {
                order_ids.push(order.dataValues.id);
              }
              conditons = {};
              conditons.order_id = { $in: order_ids };
            }
            // console.log(conditons, '====>conditons'); return;
            var total = await OrderDetail.findAll({
              attributes: [
                [db.sequelize.fn('sum', db.sequelize.col('quantity')), 'total_product'],
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`*`orderDetails`.`price` ))"), 'total_amount']
              ],
              where: conditons
            });
            var categoies = await OrderDetail.findAll({
              attributes: ['sub_category_id', 'category_id', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
              include: [{
                model: Subcat,
                attributes: ['name']
              },
              {
                model: Categories,
                attributes: ['name', 'image']
              }
              ],
              where: conditons,
              /*   group: [db.sequelize.col('`category`.`name`'),db.sequelize.col('`subcategory`.`name`')], */
              group: ['category_id', 'sub_category_id'],
            });
            var full_final = {};
            if (categoies && categoies.length > 0) {
              var final = [];
              full_final.total = total;
              for (var value of categoies) {
                conditons.sub_category_id = value.dataValues.sub_category_id;
                // conditons.category_id=value.dataValues.category_id;
                var products = await OrderDetail.findAll({
                  attributes: ['product_id', 'price', 'size', 'product_name', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
                  // order : [['id']],
                  group: ['product_id'],
                  include: [{
                    model: Product,
                    attributes: ['name', 'description', 'quantity', 'price']
                  }],
                  where: conditons,
                  order: [
                    [Product, 'name', 'ASC'],
                    [Product, 'quantity', 'ASC'],
                  ],
                });
                // value.dataValues.cat_name=value.dataValues.category.name;
                value.dataValues.Product = products;
                final.push(value);
              }
              full_final.data = final;
              full_final.orders_id = get_Ordersids;
              full_final.receipt_no = parseInt(new Date().getTime());
            }
            return responseHelper.get(res, full_final);
          }
        }
        ////////  for terminal wise  
        else {
          if (requestdata.type == 0) { // terminal today trade
            var conditons = {};
            var currentDate = new Date();
            var date = currentDate.getDate();
            var month = currentDate.getMonth();
            var year = currentDate.getFullYear();
            var monthDateYear = (month + 1) + "-" + date + "-" + year;
            var t = new Date(monthDateYear);
            var t_t = (t.getTime()) / 1000;
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.venue_id = requestdata.venue_id;
            conditons.terminal_id = requestdata.terminal_id;
            conditons.main_category_id = requestdata.main_category_id;
            conditons.conclude_status = 0;
            conditons.status = {
              $in: [2, 3, 4]
            };
            /*  conditons.createdAt = {
                 $lte: to_time,
                 $gte: t_t
             }; */
            var get_Ordersids = await Order.findAll({
              attributes: ['id'],
              where: conditons
            });
            if (get_Ordersids) {
              var order_ids = [];
              for (var order of get_Ordersids) {
                order_ids.push(order.dataValues.id);
              }
              conditons = {};
              conditons.order_id = { $in: order_ids };
            }

            // console.log(conditons, '====>conditons');
            var total = await OrderDetail.findAll({
              attributes: [
                [Sequelize.fn("min", Sequelize.col('orderDetails.timestamp')), 'start_date'],
                [Sequelize.fn("max", Sequelize.col('orderDetails.timestamp')), 'end_date'],
                [db.sequelize.fn('sum', db.sequelize.col('quantity')), 'total_product'],
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`*`orderDetails`.`price` ))"), 'total_amount']
              ],
              where: conditons
            });
            var categoies = await OrderDetail.findAll({
              attributes: ['sub_category_id', 'category_id', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
              include: [{
                model: Subcat,
                attributes: ['name']
              },
              {
                model: Categories,
                attributes: ['name', 'image']
              }
              ],
              where: conditons,
              /*  group: [db.sequelize.col('`category`.`name`'),db.sequelize.col('`subcategory`.`name`')], */
              group: ['category_id', 'sub_category_id'],
            });
            var full_final = {};
            if (categoies && categoies.length > 0) {
              var final = [];
              full_final.total = total;
              for (var value of categoies) {
                conditons.sub_category_id = value.dataValues.sub_category_id;
                // conditons.category_id=value.dataValues.category_id;
                var products = await OrderDetail.findAll({
                  attributes: ['product_id', 'price', 'size', 'product_name', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
                  group: ['product_id'],
                  include: [{
                    model: Product,
                    attributes: ['name', 'description', 'quantity', 'price']
                  }],
                  where: conditons,
                  order: [
                    [Product, 'name', 'ASC'],
                    [Product, 'quantity', 'ASC'],
                  ],
                });
                // value.dataValues.cat_name=value.dataValues.category.name;
                value.dataValues.Product = products;
                final.push(value);
              }
              full_final.data = final;
              full_final.orders_id = get_Ordersids;
            }
            return responseHelper.get(res, full_final);
          } else {
            var conditons = {};
            var t_t = requestdata.timestamp;
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.venue_id = requestdata.venue_id;
            conditons.terminal_id = requestdata.terminal_id;
            conditons.main_category_id = requestdata.main_category_id;
            conditons.conclude_status = 1;
            conditons.status = {
              $in: [2, 3, 4]
            };
            conditons.createdAt = {
              // $lte: to_time,
              $lte: requestdata.concluded_date,
              $gte: t_t
            };

            // console.log(conditons, '=========>conditons_order_ids');return;

            var get_Ordersids = await Order.findAll({
              attributes: ['id'],
              where: conditons
            });

            // console.log(get_Ordersids.length, '=---------_>get_Ordersids --> terminal'); return;

            if (get_Ordersids) {
              var order_ids = [];
              for (var order of get_Ordersids) {
                order_ids.push(order.dataValues.id);
              }
              conditons = {};
              conditons.order_id = { $in: order_ids };
            }

            // console.log(conditons, '====>conditons'); return;

            var total = await OrderDetail.findAll({
              attributes: [
                [db.sequelize.fn('sum', db.sequelize.col('quantity')), 'total_product'],
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`*`orderDetails`.`price` ))"), 'total_amount']
              ],
              where: conditons
            });
            var categoies = await OrderDetail.findAll({
              attributes: ['sub_category_id', 'category_id', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
              include: [{
                model: Subcat,
                attributes: ['name']
              },
              {
                model: Categories,
                attributes: ['name', 'image']
              }
              ],
              where: conditons,
              /*  group: [db.sequelize.col('`category`.`name`'),db.sequelize.col('`subcategory`.`name`')],  */
              group: ['category_id', 'sub_category_id'],
            });
            var full_final = {};
            if (categoies && categoies.length > 0) {
              var final = [];
              full_final.total = total;
              for (var value of categoies) {
                conditons.sub_category_id = value.dataValues.sub_category_id;
                // conditons.category_id=value.dataValues.category_id;
                var products = await OrderDetail.findAll({
                  attributes: ['product_id', 'price', 'size', 'product_name', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
                  group: ['product_id'],
                  include: [{
                    model: Product,
                    attributes: ['name', 'description', 'quantity', 'price']
                  }],
                  where: conditons,
                  order: [
                    [Product, 'name', 'ASC'],
                    [Product, 'quantity', 'ASC'],
                  ],
                });
                // value.dataValues.cat_name=value.dataValues.category.name;
                value.dataValues.Product = products;
                final.push(value);
              }
              full_final.data = final;
              full_final.orders_id = get_Ordersids;
              full_final.receipt_no = parseInt(new Date().getTime());
            }
            return responseHelper.get(res, full_final);
          }
        }

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async suspend_account(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        user_id: req.body.user_id,
        venue_id: req.body.venue_id,
        table_name: 'venues',
        // checkexit: 2
      };
      const non_required = {
        reason: req.body.reason,

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var user_data = await Venu.findOne({
          attributes: ['id', 'device_token','device_type', 'name'],
          where: {
            id: requestdata.user_id,
          }
        });

        var venu_data = await Venu.findOne({
          attributes: ['id', 'name'],
          where: {
            id: requestdata.venue_id,
          }
        });

        const fav = await Suspend.findOne({
          where: {
            user_id: requestdata.user_id,
            venue_id: requestdata.venue_id
          }
        });

        // All pending orders by suspanded Users //        
        const userOrders = await Order.findAll({
          where: {
            user_id: requestdata.user_id,
            venue_id: requestdata.venue_id,
            [Op.or]: [{ status: 1 }, { status: 2 }]
          },
          attributes: ['id', 'terminal_id'],
          group: ['terminal_id'],
        });

        if (!fav) {
          const post = await Suspend.create({
            user_id: requestdata.user_id,
            venue_id: requestdata.venue_id
          });
          if (post) {
            /* const message = {
              to: user_data.dataValues.device_token,
              collapse_key: 18,
              notification: {
                title: 'Suspended',
                body: 'Your account is suspended by ' + venu_data.dataValues.name,
              },
              data: requestdata,
            }; */



            // Send push to ordered Terminals

            if (userOrders) {

              userOrders.map(async (userOder) => {
                var terminal_data = await Venu.findOne({
                  attributes: ['id', 'name', 'device_token','device_type'],
                  where: {
                    terminal_id: userOder.terminal_id,
                  }
                });
                console.log('=====================', terminal_data.device_token);

                const terminal_message = {
                  to: terminal_data.device_token,
                  collapse_key: '18',
                  /*  notification: {
                      title: 'Suspended',
                      body: 'Your account is suspended by ' + venu_data.dataValues.name,
                      //badge : notifyCount
                  },  */
                  data: {
                    title: user_data.dataValues.name + ' is Suspended by ' + venu_data.dataValues.name,
                    body: user_data.dataValues.name + ' is Suspended by ' + venu_data.dataValues.name,
                    notification_code: 1,
                    device_type:terminal_data.device_type
                  },
                };
                // if(terminal_data.device_type == 0){
                //   terminal_message.notification = {
                //     title: user_data.dataValues.name + ' is Suspended by ' + venu_data.dataValues.name,
                //     body: user_data.dataValues.name + ' is Suspended by ' + venu_data.dataValues.name,
                //   };
                // }
                helpers.push_notification(terminal_message);
              });
            }



            const message = {
              to: user_data.dataValues.device_token,
              collapse_key: '18',
              /*  notification: {
                  title: 'Suspended',
                  body: 'Your account is suspended by ' + venu_data.dataValues.name,
                  //badge : notifyCount
              },  */
              data: {
                title: 'Your account is Suspended by ' + venu_data.dataValues.name,
                body: 'Your account is Suspended by ' + venu_data.dataValues.name,
                device_type:user_data.dataValues.device_type
              },
            };
            // if(user_data.dataValues.device_type == 0){
            //   message.notification = {
            //     title: 'Your account is Suspended by ' + venu_data.dataValues.name,
            //     body: 'Your account is Suspended by ' + venu_data.dataValues.name,
            //   };
            // }
            // console.log(message);return;
            helpers.push_notification(message);
            return responseHelper.post(res, post);
          }
        } else {
          await Suspend.destroy({
            where: {
              user_id: requestdata.user_id,
              venue_id: requestdata.venue_id
            }
          });
          // console.log(user_data.dataValues.device_token);
          //console.log(venu_data.dataValues.name); return;
          // send push to terminal 
          if (userOrders) {

            userOrders.map(async (userOder) => {
              var terminal_data = await Venu.findOne({
                attributes: ['id', 'name', 'device_token','device_type'],
                where: {
                  terminal_id: userOder.terminal_id,
                }
              });
              console.log('=====================', terminal_data.device_token);

              const terminal_message = {
                to: terminal_data.device_token,
                collapse_key: '18',
                /*  notification: {
                    title: 'Suspended',
                    body: 'Your account is suspended by ' + venu_data.dataValues.name,
                    //badge : notifyCount
                },  */
                data: {
                  title: user_data.dataValues.name + ' is Reinstated by ' + venu_data.dataValues.name,
                  body: user_data.dataValues.name + ' is Reinstated by ' + venu_data.dataValues.name,
                  notification_code: 1,
                  device_type:terminal_data.device_type

                },
              };
              // if(terminal_data.device_type == 0){
              //   terminal_message.notification = {
              //     title: user_data.dataValues.name + ' is Reinstated by ' + venu_data.dataValues.name,
              //     body: user_data.dataValues.name + ' is Reinstated by ' + venu_data.dataValues.name,
              //   };
              // }
              helpers.push_notification(terminal_message);
            });
          }
          // send push to terminal 


          const message = {
            to: user_data.dataValues.device_token,
            collapse_key: '18',
            /*  notification: {
                 title: 'Reinstated',
                 body: 'Your account is Reinstate by ' + venu_data.dataValues.name,
                 //badge : notifyCount
             }, */
            data: {
              title: 'Your account is Reinstated by ' + venu_data.dataValues.name,
              body: 'Your account is Reinstated by ' + venu_data.dataValues.name,
              device_type:user_data.dataValues.device_type
            },
          };
          // if(user_data.dataValues.device_type == 0){
          //   message.notification = {
          //     title: 'Your account is Reinstated by ' + venu_data.dataValues.name,
          //     body: 'Your account is Reinstated by ' + venu_data.dataValues.name,
          //   };
          // }
          helpers.push_notification(message);
          return responseHelper.del(res, {});
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async forgot_password(req, res) {
    try {
      // console.log(constant.url_path); return;
      const required = {
        security_key: req.headers.security_key,
        email: req.body.email,
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        let check_email = await Venu.findOne({
          where: {
            email: requestdata.email,
          }
        });
        if (!check_email) throw "email not registered";
        //var password = Math.random().toString(36).slice(-8);
        /* let password =  helpers.crypt(check_email.dataValues.password);
 console.log(password); return;

let mail = {
  from: "admin@barmate.com",
  to: check_email.dataValues.email,
  subject: "BarmateApp Forgot Password ",
  html:
    'Your  password is :' + password
}; */
        // var enc_password = helpers.crypt(password);
        /*  const save = await Venu.update({
           password: enc_password
         },
           { where: { id: check_email.dataValues.id } },

         ); */
        /*  if (save) { */
        // let send_mail = await helpers.send_mail(mail);
        let rndm = helpers.create_auth();
        let mail = {
          from: "admin@barmate.com",
          to: check_email.dataValues.email,
          subject: "BarmateApp Forgot Password (" + new Date() + ")",
          html: 'Click here to change password <a href="' +
            'http://13.236.145.2:3009/' +
            "reset_password/" +
            rndm +
            '"> Click</a>'
        };
        //console.log(mail);return false;
        await Venu.update({
          forgot_password: rndm
        }, {
            where: {
              id: check_email.dataValues.id
            }
          });
        let email = helpers.send_mail(mail);
        return responseHelper.post(res, 'Email sent, Please check');


        //}
      }
    } catch (err) {
      // throw err;
      return responseHelper.onError(res, err, err);

    }
  }
  async api_url(req, res) {
    const data = req.params;
    //console.log('hiiiiii');return;
    try {

      const chk_usr = await Venu.findOne({
        where: {
          forgot_password: data.id
        }
      });
      if (chk_usr) {
        //console.log('hiiiii'); return;

        //req.flash('info', 'Email sent, Please check it');
        res.render('settings/reset_password', {
          response: chk_usr,
          flash: "",
          hash: data.id
        });
      } else {
        res.send("Link has been expired!");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async change_passwordd(req, res) {
    const data = req.body;
    //console.log(data);return;
    try {
      const hashm = helpers.crypt(data.confirm_password);
      const updt_pwd = await Venu.update({
        password: hashm
      }, {
          where: {
            forgot_password: data.hash
          }
        });
      if (updt_pwd) {
        res.send('Password changed successfully, Please login');

      } else {
        res.send('Invalid User');
      }

    } catch (e) {
      console.log(e);
    }
  }
  async delete_sub_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        sub_category_id: req.body.sub_category_id,
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        //console.log(requestdata.sub_category_id); return;
        let sub_cat = requestdata.sub_category_id.split(",");
        // console.log(sub_cat); return;

        const update = await Subcat.update({
          is_deleted: 1
        }, {
            where: {
              id: { $in: sub_cat },
            }
          });
        if (!update) {
          throw "Error in sub category deletion."
        }
        return responseHelper.del(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async admin_list_product(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        category_id: req.query.category_id == undefined ? 0 : req.query.category_id,
        subcategories: req.query.subcategories == undefined ? 0 : req.query.subcategories,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var subcategories_ids = requestdata.subcategories;
        var productids = [];
        var conditons = {};
        //conditons.venue_id = requestdata.venue_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.category_id = requestdata.category_id;
        if (requestdata.main_category_id == 1) {

          var _terminals = await Terminal.findAll({
            attributes: ['id', 'venue_id', 'name', 'status', 'created_at'],
            where: {
              //status : 1,
              venue_id: requestdata.venue_id,
              // main_category : 
              main_category: {
                $in: [1, 3]
              },
            }

          });
        } else if (requestdata.main_category_id == 2) {
          var _terminals = await Terminal.findAll({
            attributes: ['id', 'venue_id', 'name', 'status', 'created_at'],
            where: {
              //status : 1,
              venue_id: requestdata.venue_id,
              main_category: {
                $in: [2, 3]
              },
            }
          });
        } else {
          var _terminals = await Terminal.findAll({
            attributes: ['id', 'venue_id', 'name', 'status', 'created_at'],
            where: {
              //status : 1,
              venue_id: requestdata.venue_id,
              main_category: 3
            }
          });
        };
        var Products = await Admin_Products.findAll(

          {
            attributes: ['id', 'name', 'brand_id', 'category_id', 'main_category_id', 'subcategory_id', 'price', 'image', 'description', 'cat_data', 'status', 'quantity', 'createdAt', 'updatedAt'],
            where: conditons,
            order: [
              // [Subcat, 'name', 'ASC'],
              ['name', 'ASC'],
            ],
            include: [
              // { model: Venu, attributes: ['id','name', 'image', 'email'] },
              // { model: MainCategory, attributes: ['id', 'title'] },
              //  { model: Categories, attributes: ['id','name', 'image',] }, 
              { model: Subcat, attributes: ['name'], as: 'sub_cat' },
              { model: Brand, attributes: ['name'] }
            ],

          }

        );
        if (Products) {
          await Promise.all(Products.map(async p => {
            const venue_product = await Product.findOne({
              attributes: ['id', 'venue_id', 'admin_product_id'],
              where: {
                venue_id: requestdata.venue_id,
                admin_product_id: p.dataValues.id,
                is_deleted: 0
              }
            });
            if (venue_product) {

              p.dataValues.is_added_product = 1;
            } else {
              p.dataValues.is_added_product = 0
            }
            delete p.dataValues.subcategory;
          }));
        };

        //var array3 = [ _terminals].concat([Products]);
        let data = {
          terminals: _terminals,
          products: Products
        };
        return responseHelper.get(res, data);


      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async add_new_product(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // token: req.headers.token,
        //name: req.body.name,
        // terminal_id: req.body.terminal_id,  

        //description: req.body.description,
        // price: req.body.price,
        venue_id: req.body.venue_id,
        // main_category_id: req.body.main_category_id,
        //category_id: req.body.category_id,
        //subcategory_id: req.body.subcategory_id,
        admin_product_id: req.body.admin_product_id,
        terminal_id: req.body.terminal_id,
        // description: req.body.description,
        // cat_data: req.body.cat_data,      
        //image: req.files,
        table_name: 'venues',
        // checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        let termnl = requestdata.terminal_id.split(",");
        let admin_products = requestdata.admin_product_id.split(",");

        const adm_products = await Admin_Products.findAll({
          attributes: ['id', 'name', 'brand_id', 'category_id', 'main_category_id', 'subcategory_id', 'price', 'image', 'quantity', 'description'],
          where: {
            id: {
              $in: admin_products
            }
          }
        });
        const terminal = await Terminal.findAll({
          attributes: ['id', 'name', 'venue_id'],
          where: {
            id: {
              $in: termnl
            }
          }
        });
        //console.log(adm_products[0].dataValues.id); return;
        if (terminal.length > 0) {
          if (Array.isArray(terminal) === true) {
            await Promise.all(terminal.map(async t => {
              if (adm_products.length > 0) {
                if (Array.isArray(adm_products) === true) {
                  await Promise.all(adm_products.map(async a => {
                    var _obj = {
                      terminal_id: t.id,
                      venue_id: requestdata.venue_id,
                      admin_product_id: a.id,
                      brand_id: a.brand_id,
                      is_deleted: 0,
                    };
                    ///console.log(obj);return;
                    var _obj2 = {
                      terminal_id: t.id,
                      venue_id: requestdata.venue_id,
                      admin_product_id: a.id,
                      brand_id: a.brand_id,
                      name: a.name,
                      category_id: a.category_id,
                      main_category_id: a.main_category_id,
                      subcategory_id: a.subcategory_id,
                      price: a.price,
                      image: a.image,
                      quantity: a.quantity,
                      //unit: a.unit,
                      description: a.description,
                    }
                    var _productss = await Product.findOrCreate({
                      where: _obj, // we search for this
                      defaults: _obj2 // if not found then insert this
                    });

                  }));
                } else {
                  var _obj3 = {
                    terminal_id: t.id,
                    venue_id: requestdata.venue_id,
                    admin_product_id: adm_products[0].dataValues.id,
                    brand_id: adm_products[0].dataValues.brand_id,
                    is_deleted: 0
                  };

                  var _obj4 = {
                    terminal_id: t.id,
                    venue_id: requestdata.venue_id,
                    admin_product_id: adm_products[0].dataValues.id,
                    brand_id: adm_products[0].dataValues.brand_id,
                    name: adm_products[0].dataValues.name,
                    category_id: adm_products[0].dataValues.category_id,
                    main_category_id: adm_products[0].dataValues.main_category_id,
                    subcategory_id: adm_products[0].dataValues.subcategory_id,
                    price: adm_products[0].dataValues.price,
                    image: adm_products[0].dataValues.image,
                    quantity: adm_products[0].dataValues.quantity,
                    // unit: adm_products[0].dataValues.unit,
                    description: adm_products[0].dataValues.description,
                  }
                  var _productss = await Product.findOrCreate({
                    where: _obj3, // we search for this
                    defaults: _obj4 // if not found then insert this
                  });

                }

              }


            }));

          } else {
            if (adm_products) {
              if (Array.isArray(adm_products) === true) {
                await Promise.all(adm_products.map(async a => {
                  const _obj5 = {
                    terminal_id: terminal[0].dataValues.id,
                    venue_id: requestdata.venue_id,
                    admin_product_id: a.id,
                    brand_id: a.brand_id,
                    is_deleted: 0
                  };
                  ///console.log(obj);return;
                  const _obj6 = {
                    terminal_id: terminal[0].dataValues.id,
                    venue_id: requestdata.venue_id,
                    admin_product_id: a.id,
                    brand_id: a.brand_id,
                    name: a.name,
                    category_id: a.category_id,
                    main_category_id: a.main_category_id,
                    subcategory_id: a.subcategory_id,
                    price: a.price,
                    image: a.image,
                    quantity: a.quantity,
                    //unit: a.unit,
                    description: a.description,
                  }
                  var _productss = await Product.findOrCreate({
                    where: _obj5, // we search for this
                    defaults: _obj6 // if not found then insert this
                  });

                }));
              } else {
                const _obj7 = {
                  terminal_id: terminal[0].dataValues.id,
                  venue_id: requestdata.venue_id,
                  admin_product_id: adm_products[0].dataValues.id,
                  brand_id: adm_products[0].dataValues.brand_id,
                  is_deleted: 0
                };

                const _obj8 = {
                  terminal_id: terminal[0].dataValues.id,
                  venue_id: requestdata.venue_id,
                  admin_product_id: adm_products[0].dataValues.id,
                  brand_id: adm_products[0].dataValues.brand_id,
                  name: adm_products[0].dataValues.name,
                  category_id: adm_products[0].dataValues.category_id,
                  main_category_id: adm_products[0].dataValues.main_category_id,
                  subcategory_id: adm_products[0].dataValues.subcategory_id,
                  price: adm_products[0].dataValues.price,
                  image: adm_products[0].dataValues.image,
                  quantity: adm_products[0].dataValues.quantity,
                  // unit: adm_products[0].dataValues.unit,
                  description: adm_products[0].dataValues.description,
                }
                var _productss = await Product.findOrCreate({
                  where: _obj7, // we search for this
                  defaults: _obj8 // if not found then insert this
                });

              }

            }
          }


          return responseHelper.post(res, {});
        }


        /*  var file_name = helper.file_upload(req.files.image)
 

        /*  const save = await Product.create(requestdata);
         if (!save) {
           throw "Error in Product additon.";
         } */



      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async search_venue(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        //keyword: req.body.keyword,
        user_id: req.query.user_id,
        // venue_id : req.query.venue_id
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        //console.log(requestdata.sub_category_id); return;

        // console.log(sub_cat); return;

        const Venus = await VenueSearchKeyword.findAll({
          attributes: ['venue_id'],
          include: [{
            model: Venu,
          }],
          where: {
            user_id: requestdata.user_id,
            //venue_id : requestdata.venue_id,

          },
          order: [
            ['createdAt', 'DESC']
          ],
        });
        const final = [];
        if (Venus && Venus.length > 0) {
          for (var v of Venus) {
            let check = await Suspend.count({
              where: {
                user_id: requestdata.user_id,
                venue_id: v.dataValues.venue_id,
                status: 1
              }
            });
            v.dataValues.suspend = 0;
            if (check) {
              v.dataValues.suspend = 1;
            }
            const cat = await Favourite.findOne({
              where: {
                user_id: requestdata.user_id,
                venue_id: v.dataValues.venue_id,
              }
            })
            if (cat) {
              v.dataValues.is_favourited = 1;
            } else {
              v.dataValues.is_favourited = 0
            }
            final.push(v);
          }
        }

        console.log(final);

        let finalArray = [];

        if (final) {
          const finalData = final.map(c => {
            const b = c.toJSON();
            delete b.venue_id;
            if(b.venue != null) {
              b.venue.suspend = b.suspend;
              b.venue.is_favourited = b.is_favourited;
            }
            delete b.suspend;

            if(b.venue != null) {
              // return b.venue;
              finalArray.push(b.venue);
            }
          });

          return responseHelper.post(res, finalArray);
        }
        if (!Venus) {
          throw "Error in venue search."
        }
        // return responseHelper.post(res, new_vanue);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async store_venue_search_history(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        //keyword: req.body.keyword,
        user_id: req.query.user_id,
        venue_id: req.query.venue_id
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        //console.log(requestdata.sub_category_id); return;

        // console.log(sub_cat); return;
        const objj_search = {
          user_id: requestdata.user_id,
          venue_id: requestdata.venue_id,
        };
        const ven_keywrd = await VenueSearchKeyword.findOne({
          where: objj_search
        });
        if (ven_keywrd) {
          const del_ven_keywrd = await VenueSearchKeyword.destroy({
            where: objj_search
          });
        }
        const venue = await VenueSearchKeyword.create(
          objj_search
        );
        if (!venue) {
          throw "Error in venue search."
        }
        return responseHelper.get(res, venue);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async order_date_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // main_category_id: req.query.main_category_id,
        user_id: req.query.user_id,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};

        conditons.user_id = requestdata.user_id;
        conditons.venue_id = requestdata.venue_id;
        // conditons.main_category_id=requestdata.main_category_id;
        // conditons.status=3;
        conditons.createdAt = {
          $lte: Math.floor(Date.now() / 1000),
        };
        // conditons.conclude_status = {
        //     $eq: 0,
        // };


        let Orders = await Order.findAll({
          attributes: ['createdAt', [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date']],
          include: [{
            model: Venu,
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          group: ['date'],

          order: [
            ['createdAt', 'DESC']
          ],
          where: conditons
        });
        if (Orders && Orders.length > 0) {
          await Promise.all(Orders.map(async c => {
            let check = await Suspend.count({
              where: {
                user_id: requestdata.user_id,
                venue_id: c.dataValues.venue.dataValues.id,
                status: 1
              }
            });
            if (check) {
              c.dataValues.venue.dataValues.is_suspended = 1
            } else {
              c.dataValues.venue.dataValues.is_suspended = 0
            }
            var update_time = moment.unix(c.dataValues.createdAt).format("YYYY-MM-DD");
            let ready_orders_count = await Order.count({
              where: {
                // $or: [
                //   {
                //     status: 3
                //   },
                //   {
                //     status: 2
                //   }
                // ],
                // venue_id: c.dataValues.venue.dataValues.id,
                // user_id: requestdata.user_id,
                // createdAt: {
                //   $lte: Math.floor(Date.now() / 1000),
                // }
                where: database.Sequelize.literal((`(status = 3 or status=2 or  is_refunded = 1 and userBadgeSeen = 0) AND date(FROM_UNIXTIME(createdAt)) = '${update_time}' and user_id='${requestdata.user_id}' and venue_id='${requestdata.venue_id}'`)),
              }
            });
            if (ready_orders_count) {
              c.dataValues.venue.dataValues.ready_orders_count = ready_orders_count
            }

          }));
        }
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async order_round_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        date_timestamp: req.query.date_timestamp,
        user_id: req.query.user_id,
        venue_id: req.query.venue_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};
        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 

        var to_time = parseInt(86400) + parseInt(requestdata.date_timestamp);
        // console.log(typeof parseInt(to_time)); // returns 'number'

        conditons.user_id = requestdata.user_id;
        conditons.venue_id = requestdata.venue_id;
        conditons.terminal_id = requestdata.terminal_id;
        // conditons.main_category_id=requestdata.main_category_id;
        // conditons.status=3;

        // conditons.createdAt = {
        //   $lte: to_time,
        //   $gte: requestdata.date_timestamp,
        // };
        var update_time = moment.unix(requestdata.date_timestamp).format("YYYY-MM-DD");
        conditons.createdAt = {
          $lte: to_time,
          $gte: requestdata.date_timestamp,
        };


        var Orders = await Order.findAll({
          include: [{
            model: Venu,
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          order: [
            ['id']
          ],
          where: database.Sequelize.literal((`date(FROM_UNIXTIME(createdAt)) = '${update_time}' and user_id='${requestdata.user_id}' and venue_id='${requestdata.venue_id}' and orders.terminal_id='${requestdata.terminal_id}'`)),

        });

        await Order.update({
          userBadgeSeen:1
        },{
          where: database.Sequelize.literal((`date(FROM_UNIXTIME(createdAt)) = '${update_time}' and user_id='${requestdata.user_id}' and venue_id='${requestdata.venue_id}' and orders.terminal_id='${requestdata.terminal_id}'`)),
        })
        
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async main_category_in_terminal(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.body.venue_id,
        terminal_id: req.body.terminal_id,
        main_category: req.body.main_category,

        table_name: 'venues',

      };
      const non_required = {
        table_number: req.body.table_number,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        let table_no = 0;
        if (requestdata.table_number && requestdata.table_number != '') {
          table_no = requestdata.table_number;
        }

        if (requestdata.main_category == 1) {
          var new_term = await Terminal.update({
            venue_id: requestdata.venue_id,
            //table_number: requestdata.table_number,
            table_number: table_no,
            main_category: 1,
          }, {
              where: {
                id: requestdata.terminal_id
              }
            });

        } else if (requestdata.main_category == 2) {
          var new_term = await Terminal.update({
            venue_id: requestdata.venue_id,
            main_category: 2,
            // table_number: requestdata.table_number,
            table_number: table_no,
          }, {
              where: {
                id: requestdata.terminal_id
              }
            });

        } else {
          var new_term = await Terminal.update({
            venue_id: requestdata.venue_id,
            main_category: 3,
            //table_number: requestdata.table_number,
            table_number: table_no,
          }, {
              where: {
                id: requestdata.terminal_id
              }
            });

        }

        return responseHelper.post(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async get_terminal_main_category(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var Terminals = await MainCategory.findAll();
        // console.log(Terminals)    ;
        // return;
        if (Terminals) {
          await Promise.all(Terminals.map(async p => {
            const cat = await Terminal.findOne({
              where: {
                id: requestdata.terminal_id,
                main_category: {
                  $in: [p.dataValues.id, 3]
                }
              }
            })
            if (cat) {
              p.dataValues.is_selected = 1;
            } else {
              p.dataValues.is_selected = 0
            }

            const term = await Terminal.findOne({
              attributes: ['table_number'],
              where: {
                id: requestdata.terminal_id,
              }
            });
            // console.log(term); 
            p.dataValues.table_number = term.dataValues.table_number;
          }));

        }
        return responseHelper.get(res, Terminals);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async terminal_categories(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,

        table_name: 'venues',
        venue_id: req.query.venue_id,
        terminal_id: req.query.terminal_id,
        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        /*  var Terminals = await MainCategory.findAll({
           include: [{
             model: Categories, where: {
               for_all: 1
             }
           }],


         }); */
        const term = await Terminal.findOne({
          attributes: ['id', 'venue_id', 'main_category'],
          where: {
            id: requestdata.terminal_id,
            venue_id: requestdata.venue_id,
          }
        });
        if (!term) {
          //throw 'vgjgf';
          return responseHelper.Error(res, [], 'Terminal not found');
        }
        if (term.dataValues.main_category == 1) {
          var _Terminals = await MainCategory.findAll({
            include: [{
              model: Categories,
              where: {
                for_all: 1
              }
            }],
            where: {
              id: 1
            }
          });

        } else if (term.dataValues.main_category == 2) {
          var _Terminals = await MainCategory.findAll({
            include: [{
              model: Categories,
              where: {
                for_all: 1
              }
            }],
            where: {
              id: 2
            }
          });

        } else {

          var _Terminals = await MainCategory.findAll({
            include: [{
              model: Categories,
              where: {
                for_all: 1
              }
            }],
          });

        }
        if (_Terminals) {
          await Promise.all(_Terminals.map(async c => {
            // checking beverages category
            const check_main_cat1 = await VenuCat.findOne({
              attributes: ['id'],
              where: {
                venue_id: requestdata.venue_id,
                main_category_id: 1
              }
            });
            if (check_main_cat1) {
              c.dataValues.isBeverages = 1
            } else {
              c.dataValues.isBeverages = 0
            }
            // checking food category
            const check_main_cat2 = await VenuCat.findOne({
              attributes: ['id'],
              where: {
                venue_id: requestdata.venue_id,
                main_category_id: 2
              }
            });
            if (check_main_cat2) {
              c.dataValues.isFood = 1
            } else {
              c.dataValues.isFood = 0
            }
            // checking that categories are selected by terminal or not
            await Promise.all(c.categories.map(async i => {
              const check_category = await VenuCat.findOne({
                attributes: ['id'],
                where: {
                  venue_id: requestdata.venue_id,
                  category_id: i.id
                }
              });
              if (check_category) {
                i.dataValues.is_selected = 1
              } else {
                i.dataValues.is_selected = 0
              }
              delete i.dataValues.venueId
              delete i.dataValues.venue_id
              delete i.dataValues.status
            }))
          }));
          return responseHelper.post(res, _Terminals);
        }


      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async favourite_venue(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,

        table_name: 'venues',
        user_id: req.body.user_id,
        venue_id: req.body.venue_id,
        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const fav = await Favourite.findOne({
          where: {
            user_id: requestdata.user_id,
            venue_id: requestdata.venue_id
          }
        });

        if (!fav) {
          const post = await Favourite.create({
            user_id: requestdata.user_id,
            venue_id: requestdata.venue_id
          });
          if (post) {
            return responseHelper.post(res, post);
          }
        } else {
          await Favourite.destroy({
            where: {
              user_id: requestdata.user_id,
              venue_id: requestdata.venue_id
            }
          });
          return responseHelper.del(res, 'venue unfavourited successfully');
        }

      }

    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async favourite_venue_list(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        user_id: req.query.user_id,

      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const Venus = await Favourite.findAll({
          attributes: ['id', 'user_id', 'venue_id'],
          include: [{
            model: Venu,
            required: true,
          },

          ],
          where: {
            user_id: requestdata.user_id,
            //venue_id : requestdata.venue_id,

          },
          order: [
            ['createdAt', 'DESC']
          ],
        });
        //console.log(Venus); return;
        /* if (!Venus) {
          throw "Error in venue search."
        } */
        const final = [];
        if (Venus && Venus.length > 0) {
          for (var v of Venus) {
            let check = await Suspend.count({
              where: {
                user_id: requestdata.user_id,
                venue_id: v.dataValues.venue_id,
                status: 1
              }
            });
            v.dataValues.suspend = 0;
            if (check) {
              v.dataValues.suspend = 1;
            }
            const cat = await Favourite.findOne({
              where: {
                user_id: requestdata.user_id,
                venue_id: v.dataValues.venue_id,
              }
            })
            if (cat) {
              v.dataValues.is_favourited = 1;
            } else {
              v.dataValues.is_favourited = 0
            }
            final.push(v);
          }
        }

        if (final) {
          const finalData = final.map(c => {
            const b = c.toJSON();
            delete b.id;
            delete b.user_id;
            delete b.venue_id;
            b.venue.suspend = b.suspend;
            b.venue.is_favourited = b.is_favourited;
            delete b.suspend;
            return b.venue;
          });

          return responseHelper.get(res, finalData);
        }

        // return responseHelper.post(res, new_vanue);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async venue_category_listing(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,

        // venue_id: req.query.venue_id,
        // type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var Venus = await Categories.findAll({
          attributes: ['id', 'name', 'main_category_id'],
          include: [{
            model: MainCategory,
            attributes: ['title']
          }]


        });
        if (!Venus) {
          return responseHelper.Error(res, [], 'Categories not found');
        }
        if (Venus) {
          const finalData = Venus.map(c => {
            const b = c.toJSON();
            b.main_category_name = b.mainCategory.title;
            delete b.mainCategory
            return b;
          });
          return responseHelper.get(res, finalData);
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async delete_venue_products(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.body.venue_id,
        category_id: req.body.category_id,

        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        /*  var user_data = await Product.findOne({
           where: {
             id: requestdata.id,
             venue_id: requestdata.venue_id,
           }
         });
         if (!user_data) {
           throw "Invalid id for delete."
         } */

        let prdct = requestdata.category_id.split(",");
        const save = await Product.update({
          is_deleted: 1
        }, {
            where: {
              venue_id: requestdata.venue_id,
              category_id: { $in: prdct },

            }
          });
        /*  if (!save) {
           throw "No product found"
         }
          */
        return responseHelper.del(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async terms_and_conditions(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,

        // venue_id: req.query.venue_id,
        // type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var Venus = await Content.findOne({
          attributes: ['id', 'title', 'description'],
          where: {
            id: 2
          }
        });
        if (!Venus) {
          return responseHelper.Error(res, {}, 'Terms & conditions not found');
        }

        return responseHelper.get(res, Venus);

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async privacy_policy(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,

        // venue_id: req.query.venue_id,
        // type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var Venus = await Content.findOne({
          attributes: ['id', 'title', 'description'],
          where: {
            id: 1
          }
        });
        if (!Venus) {
          return responseHelper.Error(res, {}, 'Privacy Policy not found');
        }

        return responseHelper.get(res, Venus);

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async venue_open_close(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,

        venue_id: req.body.venue_id,
        type: req.body.type,
        // type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const Venus = await Venu.findOne({
          attributes: ['id'],
          where: {
            id: requestdata.venue_id,
            user_type: 0
          }
        });
        if (!Venus) {
          return responseHelper.Error(res, {}, 'Venu not found');
        }
        const venue_open = await Venu.update({
          open: requestdata.type
        }, {
            where: {
              id: requestdata.venue_id,
              user_type: 0
            }
          })

        return responseHelper.post(res, {});

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async report(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,

        report_by: req.body.report_by,
        type: req.body.type,
        reason: req.body.reason,

        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const Venus = await Venu.findOne({
          attributes: ['id', 'name', 'email'],
          where: {
            id: requestdata.report_by,
          }
        });
        if (!Venus) {
          if (requestdata.type == 0) {
            return responseHelper.Error(res, {}, 'Venu not found');
          } else {
            return responseHelper.Error(res, {}, 'User not found');
          }
        }
        const venue_open = await Report.create({
          report_by: requestdata.report_by,
          reason: requestdata.reason,
          type: requestdata.type
        });

        let mail = {
          from: Venus.dataValues.email,
          to: "sandeep@cqlsys.co.uk",
          subject: "Barmate App Report (" + new Date() + ")",
          html: `<p> Name : ${Venus.dataValues.name} </p> <p> Email : ${Venus.dataValues.email} </p>  <p> Report Reason : ${requestdata.reason} </p>`
        };
        //console.log(mail);return false;

        let email = helpers.send_mail(mail);

        return responseHelper.post(res, venue_open);

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async review(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,

        review_by: req.body.review_by,
        type: req.body.type,
        comment: req.body.comment,

        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const Venus = await Venu.findOne({
          attributes: ['id', 'name', 'email'],
          where: {
            id: requestdata.review_by,
          }
        });
        if (!Venus) {
          if (requestdata.type == 0) {
            return responseHelper.Error(res, {}, 'Venu not found');
          } else {
            return responseHelper.Error(res, {}, 'User not found');
          }
        }
        const venue_open = await Review.create({
          review_by: requestdata.review_by,
          comment: requestdata.comment,
          type: requestdata.type
        });

        let mail = {
          from: Venus.dataValues.email,
          to: "sandeep@cqlsys.co.uk",
          subject: "Barmate App Reviews (" + new Date() + ")",
          html: `<p> Name : ${Venus.dataValues.name} </p> <p> Email : ${Venus.dataValues.email} </p> <p> Review : ${requestdata.comment} </p>`
        };
        //console.log(mail);return false;

        let email = helpers.send_mail(mail);

        return responseHelper.post(res, venue_open);

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async search_products(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        venue_id: req.query.venue_id,
        terminal_id: req.query.terminal_id,
        keyword: req.query.keyword,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        category_id: req.query.category_id == undefined ? 0 : req.query.category_id,
        subcategories: req.query.subcategories == undefined ? 0 : req.query.subcategories,


      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        // console.log(requestdata);  
        // return ; 

        /*  var subcategories_ids = requestdata.subcategories;
         var productids = []; */
        /*  var conditons = {};
         conditons.venue_id = requestdata.venue_id;
         conditons.main_category_id = requestdata.main_category_id;
         conditons.category_id = requestdata.category_id;
         conditons.name = requestdata.keyword; */

        requestdata.keyword = requestdata.keyword.trim();
        var Products = await Product.findAll(

          {
            attributes: ['id', 'name', 'category_id', 'main_category_id', 'venue_id', 'terminal_id', 'subcategory_id', 'admin_product_id', 'price', 'image', 'description', 'quantity', 'cat_data', 'status', 'createdAt', 'updatedAt'],
            where: {
              venue_id: requestdata.venue_id,
              terminal_id: requestdata.terminal_id,
              main_category_id: requestdata.main_category_id,
              category_id: requestdata.category_id,
              is_deleted: 0,
              name: {
                $like: '%' + requestdata.keyword + '%'
              }
            },
            group: ['admin_product_id'],
            order: [
              // [Subcat, 'name', 'ASC'],
              ['name', 'ASC'],
            ],
            include: [
              // { model: Venu, attributes: ['id','name', 'image', 'email'] },
              // { model: MainCategory, attributes: ['id', 'title'] },
              //  { model: Categories, attributes: ['id','name', 'image',] }, 
              { model: Subcat, attributes: ['name'], as: 'sub_category', },
              { model: Brand, attributes: ['id', 'name'] },
            ],

          }

        );
        if (Products) {
          await Promise.all(Products.map(async p => {
            delete p.dataValues.subcategory;
          }));
        }
        // ads data 
        const get_ads = await Ads.findAll({
          attributes: ['id', 'title', 'description', 'media', 'link', 'createdAt'],
          where: {
            venue_id: requestdata.venue_id
          },
          order: [
            [Sequelize.fn('RAND')]
          ]
        });

        const newData = {
          ProductsList: Products,
          AdsList: get_ads
        };
        return responseHelper.get(res, newData);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async terminal_current_order_listing(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        // category_id: req.query.category_id == undefined ? 0 : req.query.category_id,
        // subcategories: req.query.subcategories == undefined ? 0 : req.query.subcategories, 
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        // console.log(requestdata);  
        // return ; 
        // var subcategories_ids =requestdata.subcategories ;
        var productids = [];
        var conditons = {};
        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 
        // var to_time= 86400 +'+'+ t_t;
        var to_time = parseInt(86400) + parseInt(t_t);
        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = {
          $in: [1, 2, 3]
        };
        conditons.conclude_status = 0;
        /*  conditons.createdAt = {
             $lte: to_time,
             $gte: t_t
         }; */
        // console.log(conditons);
        var Orders = await Order.findAll({
          include: [{
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          order: [
            ['id']
          ],
          where: conditons
        });
        // Math.floor(Date.now() / 1000),
        // console.log(t_t/1000);
        // return;
        if (Orders && Orders.length > 0) {
          for (let c in Orders) {
            Orders[c].dataValues.order_number = parseInt(c) + 1;
            const get_order_count = await Order.findAndCount({
              where: {
                terminal_id: requestdata.terminal_id,
                status: {
                  $in: [1, 2]
                },
                main_category_id: requestdata.main_category_id,
                conclude_status : 0
              }
            });
            Orders[c].dataValues.Order_count = get_order_count.count;
          }
        }
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  // new past order listing acc to terminal
  async terminal_past_order_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 
        // var to_time= 86400 +'+'+t_t;
        var to_time = parseInt(86400) + parseInt(t_t);

        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = 4;
        conditons.conclude_status = 0;
        // conditons.createdAt ={
        //   $lte : Math.floor(Date.now() / 1000),          
        // };          

        var Orders = await Order.findAll({
          include: [{
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          order: [
            ['id']
          ],
          where: conditons
          // where:{
          //   terminal_id:requestdata.terminal_id,
          //   main_category_id:requestdata.main_category_id,
          //   conclude_status:0,
          //   is_refunded:1
          // },
          // where: {
          //   [Op.and]: [
          //     {
          //       terminal_id:requestdata.terminal_id,
          //         main_category_id:requestdata.main_category_id,
          //         conclude_status:0,
          //         // is_refunded:1
          //     },
          //     {
          //       [Op.or]: [
          //         {
          //           status: 4
          //         },
          //         {
          //           status: 5,
          //           is_refunded:1
          //         },
                  
          //       ],
          //     },
              
          //   ],
           

          // }

        });
        //  console.log(Orders,"Orders==========");return
        if (Orders && Orders.length > 0) {
          for (let c in Orders) {
            Orders[c].dataValues.order_number = parseInt(c) + 1;
          }
        }
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  // new today trade api acc. to terminal
  async terminal_today_trade(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        timestamp: req.query.timestamp == undefined ? 0 : req.query.timestamp,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        if (requestdata.type == 0) { // for today trade
          var conditons = {};
          var currentDate = new Date();
          var date = currentDate.getDate();
          var month = currentDate.getMonth();
          var year = currentDate.getFullYear();
          var monthDateYear = (month + 1) + "-" + date + "-" + year;

          var t = new Date(monthDateYear);
          var t_t = (t.getTime()) / 1000;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.terminal_id = requestdata.terminal_id;
          conditons.main_category_id = requestdata.main_category_id;
          conditons.conclude_status = 0;
          conditons.status = {
            $in: [2, 3, 4]
          };
          /*  conditons.createdAt = {
               $lte: to_time,
               $gte: t_t
           }; */
          var get_Ordersids = await Order.findAll({
            attributes: ['id'],
            where: conditons
          });
          // console.log(get_Ordersids);return;
          if (get_Ordersids) {
            var order_ids = [];
            for (var order of get_Ordersids) {
              order_ids.push(order.dataValues.id);
            }
            conditons = {};
            conditons.order_id = { $in: order_ids };
          }
          var total = await OrderDetail.findAll({
            attributes: [
              [Sequelize.fn("min", Sequelize.col('orderDetails.timestamp')), 'start_date'],
              [Sequelize.fn("max", Sequelize.col('orderDetails.timestamp')), 'end_date'],
              [db.sequelize.fn('sum', db.sequelize.col('quantity')), 'total_product'],
              [db.sequelize.literal("(sum(`orderDetails`.`quantity`*`orderDetails`.`price` ))"), 'total_amount']
            ],
            where: conditons
          });
          var categoies = await OrderDetail.findAll({
            attributes: ['sub_category_id', 'category_id', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
            include: [{
              model: Subcat,
              attributes: ['name']
            },
            {
              model: Categories,
              attributes: ['name', 'image']
            }
            ],
            where: conditons,
            /*   group: ['category_id',db.sequelize.col('`category`.`name`'),db.sequelize.col('`subcategory`.`name`')],   */
            group: ['category_id', 'sub_category_id'],
          });
          // console.log(categoies);
          // res.send(categoies); return;
          var full_final = {};
          if (categoies && categoies.length > 0) {
            var final = [];
            full_final.total = total;
            for (var value of categoies) {
              // console.log(value);
              conditons.sub_category_id = value.dataValues.sub_category_id;
              var products = await OrderDetail.findAll({
                attributes: ['product_id', 'price', 'size', 'product_name', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
                // order : [['id']],
                group: ['product_id'],
                include: [{
                  model: Product,
                  attributes: ['name', 'description', 'quantity', 'price']
                }],
                where: conditons,
                order: [
                  [Product, 'name', 'ASC'],
                  [Product, 'quantity', 'ASC'],
                ],
              });
              value.dataValues.Product = products;
              final.push(value);
            }
            full_final.data = final;
            full_final.orders_id = get_Ordersids;
            full_final.receipt_no = parseInt(new Date().getTime());
          }
          return responseHelper.get(res, full_final);
        } else { // for history 
          var conditons = {};
          var t_t = requestdata.timestamp;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.terminal_id = requestdata.terminal_id;
          conditons.main_category_id = requestdata.main_category_id;
          conditons.conclude_status = 1;
          conditons.status = {
            $in: [2, 3, 4]
          };
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
          var get_Ordersids = await Order.findAll({
            attributes: ['id'],
            where: conditons
          });
          // console.log(get_Ordersids);return;
          if (get_Ordersids) {
            var order_ids = [];
            for (var order of get_Ordersids) {
              order_ids.push(order.dataValues.id);
            }
            conditons = {};
            conditons.order_id = { $in: order_ids };
          }
          var total = await OrderDetail.findAll({
            attributes: [
              [db.sequelize.fn('sum', db.sequelize.col('quantity')), 'total_product'],
              [db.sequelize.literal("(sum(`orderDetails`.`quantity`*`orderDetails`.`price` ))"), 'total_amount']
            ],
            where: conditons
          });
          var categoies = await OrderDetail.findAll({
            attributes: ['sub_category_id', 'category_id', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
            include: [{
              model: Subcat,
              attributes: ['name']
            },
            {
              model: Categories,
              attributes: ['name', 'image']
            }
            ],
            where: conditons,
            /*   group: ['category_id',db.sequelize.col('`category`.`name`'),db.sequelize.col('`subcategory`.`name`')], */
            group: ['category_id', 'sub_category_id'],
          });
          var full_final = {};
          if (categoies && categoies.length > 0) {
            var final = [];
            full_final.total = total;
            for (var value of categoies) {
              conditons.sub_category_id = value.dataValues.sub_category_id;
              var products = await OrderDetail.findAll({
                attributes: ['product_id', 'price', 'size', 'product_name', [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total']],
                // order : [['id']],
                group: ['product_id'],
                include: [{
                  model: Product,
                  attributes: ['name', 'description', 'quantity', 'price']
                }],
                where: conditons,
                order: [
                  [Product, 'name', 'ASC'],
                  [Product, 'quantity', 'ASC'],
                ],
              });
              value.dataValues.Product = products;
              final.push(value);
            }
            full_final.data = final;
            full_final.orders_id = get_Ordersids;
            full_final.receipt_no = parseInt(new Date().getTime());
          }
          return responseHelper.get(res, full_final);
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  // new history acc. to terminal-------------------------//
  async terminal_history(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        date_timestamp: req.query.date_timestamp,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};
        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.conclude_status = 1;
        conditons.status = {
          $in: [2, 3, 4]
        };
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = requestdata.date_timestamp;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }
        var Orders = await Order.findAll({
          attributes: [
            // [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date'],
            [db.sequelize.literal("(SELECT `createdAt`)"), 'start_date'],
            [db.sequelize.literal("(SELECT Max(`createdAt`))"), 'concluded_date'],
            [db.sequelize.fn('count', 'date'), 'order_count'], 'createdAt', 'user_id'
          ],
          where: conditons,
          group: ['order_group'],
          order: [
            ['createdAt', 'DESC']
          ],
        });
        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  //// new today customers api acc. to terminal
  async terminal_today_customer_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        today: 1,
        // today: req.query.today,

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        // add one day timestamp 
        // var to_time= 86400 +'+'+t_t;
        var to_time = parseInt(86400) + parseInt(t_t);

        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        //conditons.status = 4;
        conditons.status = {
          $in: [2, 3, 4]
        };
        conditons.conclude_status = 0;
        if (requestdata.today == 1) {
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }



        var Orders = await Order.findAll({
          // include :[{

          //   model : User,
          //       as: 'userDetails',
          //       attributes :[
          //         'id','name','image'
          //       ]
          //     }
          // ],
          attributes: ['user_id'],
          group: ['user_id'],
          order: [
            ['id']
          ],
          where: conditons
        });
        let user_ids = [];
        if (Orders && Orders.length > 0) {
          for (var val of Orders) {
            user_ids.push(val.dataValues.user_id)
          }
        }

        // console.log(Orders);
        var Users = await User.findAll({
          attributes: [
            'id', 'name', 'image'
          ],
          where: {
            id: { $in: user_ids }
          }
        })
        return responseHelper.get(res, Users);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  // new customer listing by name acc . to terminal
  async terminal_customer_listing_by_name(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        q: req.query.q,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};
        var user = {};
        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = 4;
        if (requestdata.q) {
          user.name = {
            [Op.like]: '%' + requestdata.q + '%'
          };
        }
        var Orders = await Order.findAll({
          // include :[{

          //   model : User,
          //       as: 'userDetails',
          //       attributes :[
          //         'id','name','image'
          //       ]
          //     }
          // ],
          attributes: ['user_id'],
          group: ['user_id'],
          order: [
            ['id']
          ],
          where: conditons
        });
        let user_ids = [];
        if (Orders && Orders.length > 0) {
          for (var val of Orders) {
            user_ids.push(val.dataValues.user_id)
          }
        }

        // console.log(Orders);
        user.id = { $in: user_ids };
        var Users = await User.findAll({
          attributes: [
            'id', 'name', 'image'
          ],
          where: user
        })
        return responseHelper.get(res, Users);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  // new customer listing by date acc . to terminal
  async terminal_customer_listing_for_particular_date(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        date_timestamp: req.query.date_timestamp,
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};
        var user = {};
        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.status = 4;
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = requestdata.date_timestamp;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }

        var Orders = await Order.findAll({
          attributes: ['user_id'],
          group: ['user_id'],
          order: [
            ['id']
          ],
          where: conditons
        });
        let user_ids = [];
        if (Orders && Orders.length > 0) {
          for (var val of Orders) {
            user_ids.push(val.dataValues.user_id)
          }
        }

        // console.log(Orders);
        user.id = { $in: user_ids };
        var Users = await User.findAll({
          attributes: [
            'id', 'name', 'image'
          ],
          where: user
        })
        return responseHelper.get(res, Users);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  /// making order api acc to terminal scenerio
  async order_status(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        order_id: req.body.order_id,
        status: req.body.status,
        terminal_id: req.body.terminal_id,

        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        var conditons = {};
        conditons.terminal_id = requestdata.terminal_id;
        conditons.id = requestdata.order_id;
        
        const order = await Order.findOne({
            where: conditons,
            attributes:['status']
        });
        if(order.status == 5){
          return responseHelper.Error(res, {}, 'Order is already cancelled');
        }
        const save = await Order.update({
          status: requestdata.status
        }, {
            where: conditons,
            returning: true
          });
        var Orders = await Order.findOne({
          include: [{
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image', 'device_token','device_type'
            ]
          },],
          where: conditons
        }).then(data => {
          // console.log(data);
          if (requestdata.status == 2) {
            //var msg = 'Your order is making now.';
            var msg = 'Your order is being made';
            var collapse_key_code = '2';
            var notification_code = 2;

          } else if (requestdata.status == 3) {
            // var msg = 'Your order is prepared now.You can collect it.';
            var msg = 'Your order is ready to collect';
            var collapse_key_code = '3';
            var notification_code = 3;
          }
          data.dataValues.notification_type = notification_code;
          // data.dataValues.order_id = requestdata.order_id;
          // data.dataValues.terminal_id = requestdata.terminal_id;

          // console.log(data.dataValues.userDetails);
          // return;
          const message = {
            to: data.dataValues.userDetails.device_token,
            collapse_key: collapse_key_code,
            /*  notification: {
                 title: 'Order Update',
                 body: msg,
             }, */
            data: {
              title: msg,
              body: msg,
              order_id: requestdata.order_id,
              venue_id: data.dataValues.venue_id,
              device_type:data.dataValues.userDetails.device_type


            },
            // data: data,
          };
          // if(data.dataValues.userDetails.device_type == 0){
          //   message.notification = {
          //     title: msg,
          //     body: msg,
          //   };
          // }
          helpers.push_notification(message);
          return responseHelper.post(res, data);
        });

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  /// =====> terminal order listing by date 
  async terminal_order_listing_by_date(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {
        date_timestamp: req.query.date_timestamp,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};
        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = requestdata.date_timestamp;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }
        var Orders = await Order.findAll({
          attributes: [
            [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date'],
            [db.sequelize.fn('count', 'date'), 'order_count'], 'createdAt', 'user_id'
          ],
          // include :[{
          //   model : User,
          //       as: 'userDetails',
          //       attributes :[
          //         'id','name','image'
          //       ]
          //     }
          // ],
          where: conditons,
          group: ['date'],
          order: [
            ['createdAt', 'DESC']
          ],
        });
        // var Orders = await db.sequelize.query("SELECT  DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y') AS 'date_formatted' from orders  GROUP BY date_formatted having date_formatted = '28-02-2019'");


        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  //// single  customer orders acc to terminal 
  async terminal_customer_orders(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        user_id: req.query.user_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};
        conditons.terminal_id = requestdata.terminal_id;
        conditons.main_category_id = requestdata.main_category_id;
        conditons.user_id = requestdata.user_id;
        if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
          var t_t = requestdata.date_timestamp;
          var to_time = parseInt(86400) + parseInt(t_t);
          conditons.createdAt = {
            $lte: to_time,
            $gte: t_t
          };
        }
        var Orders = await Order.findAll({
          attributes: [
            [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date'],
            [db.sequelize.fn('count', 'date'), 'order_count'], 'createdAt', 'user_id'
          ],
          where: conditons,
          group: ['date'],
          order: [
            ['createdAt', 'DESC']
          ],
        });
        // var Orders = await db.sequelize.query("SELECT  DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y') AS 'date_formatted' from orders  GROUP BY date_formatted having date_formatted = '28-02-2019'");


        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  ////// terminal order details
  async terminal_order_detail(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        order_id: req.query.order_id,
        terminal_id: req.query.terminal_id,
        venue_id: req.query.venue_id,

        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        var productids = [];
        var conditons = {};
        conditons.terminal_id = requestdata.terminal_id;
        conditons.id = requestdata.order_id;


        var Orders = await Order.find({
          include: [{
            model: Terminal,
            attributes: [
              'id', 'name', 'table_number', 'is_main'
            ]
          },
          {
            model: Venu,
            attributes: [
              'id', 'name', 'image'
            ]
          },
          {
            model: Subcat,
            attributes: [
              'id', 'name'
            ]
          },
          {
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          },
          {
            model: OrderDetail,
            attributes: ['quantity', 'price', 'size', 'product_name', 'instructions'],
            include: {
              model: Product,
              attributes: ['name', 'price', 'image', 'description', 'quantity'],
              include: [{
                model: Subcat,
                attributes: [
                  'name'
                ]
              }, {
                model: Brand,
                attributes: ['name']
              }]
            }
          },

          ],
          order: [
            ['id']
          ],
          where: conditons
        });
        if (!Orders) {
          return responseHelper.Error(res, {}, 'No data found');
        }

        var currentDate = new Date(Orders.dataValues.createdAt * 1000);
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        var year = currentDate.getFullYear();
        var monthDateYear = (month + 1) + "-" + date + "-" + year;
        // console.log(monthDateYear);
        var t = new Date(monthDateYear);
        var t_t = (t.getTime()) / 1000;
        var to_time = parseInt(86400) + parseInt(t_t);

        // console.log(t_t);
        var queue = await Order.count({
          where: {
            terminal_id: requestdata.terminal_id,
            id: {
              $lte: requestdata.order_id,
            },
            createdAt: {
              $lte: to_time,
              $gte: t_t
            },
            status: {
              $not: 4
            }
          }
        });

        let round = await Order.count({
          where: {
            // venue_id: Orders.dataValues.venue_id,
            terminal_id: requestdata.terminal_id,
            user_id: Orders.dataValues.user_id,
            id: {
              $lte: requestdata.order_id,
            },
            createdAt: {
              $lte: to_time,
              $gte: t_t
            },
            //  status :{
            //    $not : 3
            //  }
          }
        });
        //  console.log(round);

        Orders.dataValues.queue = queue;
        Orders.dataValues.round = round;

        let check = await Suspend.count({
          where: {
            user_id: Orders.dataValues.user_id,
            venue_id: requestdata.venue_id,
            status: 1
          }
        });
        if (check) {
          Orders.dataValues.suspend_by_venue = 1;
        } else {
          Orders.dataValues.suspend_by_venue = 0;
        }

        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  /////// terminal customer order detail 
  async terminal_wise_customer_order_detail(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // venue_id: req.query.venue_id,
        terminal_id: req.query.terminal_id,
        date_timestamp: req.query.date_timestamp,
        main_category_id: req.query.main_category_id,
        user_id: req.query.user_id,
        type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        if (requestdata.type == 1) { // for today customers
          var conditons = {};
          // conditons.venue_id = requestdata.venue_id;
          conditons.terminal_id = requestdata.terminal_id;
          // conditons.id=requestdata.order_id;
          conditons.user_id = requestdata.user_id;
          conditons.main_category_id = requestdata.main_category_id;
          conditons.conclude_status = 0;
          if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
            var t_t = parseInt(requestdata.date_timestamp);
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.createdAt = {
              $lte: to_time,
              $gte: t_t
            };
          }
          var Orders = await Order.findAll({
            include: [{
              model: OrderDetail,
              attributes: ['quantity', 'price', 'size', 'product_name'],
              include: {
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }
            },],
            /*  order: [
                 ['id']
             ], */
            where: conditons,
            order: [
              ['id', 'ASC'],
              [db.sequelize.col('`orderDetails->product`.`name`'), 'ASC'],
            ],
          });
          delete conditons.createdAt;
          conditons.timestamp = {
            $lte: to_time,
            $gte: t_t
          };
          let final = {};
          if (Orders) {
            final.rounds = Orders;
            var order_ids = [];
            for (var order of Orders) {
              /* let check = await Suspend.count({
                   where: {
                       user_id: requestdata.user_id,
                       venue_id: requestdata.venue_id,
                       status: 1
                   }
               });
               if (check) {
                   order.dataValues.suspend = 1;
               } else {
                   order.dataValues.suspend = 0;
               } */
              order_ids.push(order.dataValues.id);
            }

            var quantities = await OrderDetail.findAll({
              attributes: ['size', 'product_name', 'price',
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total'],
                [db.sequelize.literal(" (sum(`orderDetails`.`price` * `orderDetails`.`quantity`))"), 'total_price']
              ],
              include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }],
              group: ['product_id'],
              where: {
                order_id: {
                  $in: order_ids
                }
              }
            });
            final.quantities = quantities;


          }
          return responseHelper.get(res, final);
        } else { // for all customers
          var conditons = {};
          // conditons.venue_id = requestdata.venue_id;
          conditons.terminal_id = requestdata.terminal_id;
          // conditons.id=requestdata.order_id;
          conditons.user_id = requestdata.user_id;
          conditons.main_category_id = requestdata.main_category_id;
          //conditons.conclude_status = 0;
          if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
            var t_t = parseInt(requestdata.date_timestamp);
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.createdAt = {
              $lte: to_time,
              $gte: t_t
            };
          }
          var Orders = await Order.findAll({
            include: [{
              model: OrderDetail,
              attributes: ['quantity', 'price', 'size', 'product_name'],
              include: {
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }
            },],
            /*   order: [
                  ['id']
              ], */
            where: conditons,
            order: [
              ['id', 'ASC'],
              [db.sequelize.col('`orderDetails->product`.`name`'), 'ASC'],
            ],
          });
          delete conditons.createdAt;
          conditons.timestamp = {
            $lte: to_time,
            $gte: t_t
          };
          let final = {};
          if (Orders) {
            final.rounds = Orders;
            var order_ids = [];
            for (var order of Orders) {

              order_ids.push(order.dataValues.id);
            }

            var quantities = await OrderDetail.findAll({
              attributes: ['size', 'product_name', 'price',
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total'],
                [db.sequelize.literal(" (sum(`orderDetails`.`price` * `orderDetails`.`quantity`))"), 'total_price']

              ],
              include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }],
              group: ['product_id'],
              where: {
                order_id: {
                  $in: order_ids
                }
              }
            });
            final.quantities = quantities;


          }
          return responseHelper.get(res, final);
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async collect_order_user(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        order_id: req.body.order_id,
        status: req.body.status,
        user_id: req.body.user_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var conditons = {};
        conditons.user_id = requestdata.user_id;
        conditons.id = requestdata.order_id;

        const trmnl = await Order.findOne({
          // attributes: ['id', 'terminal_id', 'venue_id', 'user_id'],
          where: {
            id: requestdata.order_id,
            user_id: requestdata.user_id
          }
        });
        if(trmnl.status == 5){
          return responseHelper.Error(res, {}, 'Order is already cancelled');
        }
        const save = await Order.update({
          status: requestdata.status
        }, {
            where: conditons,
            returning: true
          });
        if (!trmnl) {
          return responseHelper.Error(res, {}, 'Order not found');
        }

        const terminal_push = await Venu.findOne({
          attributes: ['id', 'name', 'image', 'device_type', 'device_token'],
          where: {
            terminal_id: trmnl.dataValues.terminal_id
          }
        });

        const user_push = await Venu.findOne({
          attributes: ['id', 'name', 'image'],
          where: {
            id: trmnl.dataValues.user_id
          }
        });
        const main_cat_name = await MainCategory.findOne({
          attributes: ['title'],
          where: {
            id: trmnl.dataValues.main_category_id,
          }
        });

        if (terminal_push) {
          var msg = 'Order is collected by ' + user_push.dataValues.name;
          var collapse_key_code = '4';
          var notification_code = 4;
          trmnl.dataValues.notification_type = notification_code;

          const message = {
            to: terminal_push.dataValues.device_token,
            collapse_key: collapse_key_code,
            /*  notification: {
                 title: 'Order Update',
                 body: msg,
             }, */
            //data: trmnl,
            data: {
              title: msg,
              body: msg,
              order_id: requestdata.order_id,
              main_category_id: trmnl.dataValues.main_category_id,
              main_category_name: main_cat_name.dataValues.title,
              device_type:terminal_push.dataValues.device_type
            },
          };
          // if(terminal_push.dataValues.device_type == 0){
          //   message.notification = {
          //     title: msg,
          //     body: msg,
          //   };
          // }
          helpers.push_notification(message);

          //payment to venue on order making
          // await Transactions.findOne({
          //   where: {
          //     order_id: requestdata.order_id
          //   }
          // }).then(async (trasaction) => {

          //   const venue = await Venu.findOne({
          //     attributes: ['id', 'paypal_id', 'device_type', 'device_token','account_id'],
          //     where: {
          //       id: trasaction.dataValues.venue_id
          //     }
          //   });

          //   // console.log(venue);
          //   // return false;
          //   let sender_batch_id = Math.random().toString(36).substring(9);
          //   // const splited_amount = (trasaction.dataValues.amount - 0.30) * 3.25 / 100;
          //   // const splited_amount = trasaction.dataValues.amount * 0.05;

          //   let num = trasaction.dataValues.amount - 0.30;
          //   num = parseFloat(num);
          //   num = num - (0.0175 * trasaction.dataValues.amount);
          //   num = parseFloat(num);
          //   num = num - (0.0325 * num);
          //   num = num.toFixed(2);
          //   num = parseFloat(num) * 100;

          //   // const num = trasaction.dataValues.amount - splited_amount;

          //   var total_amount = num.toFixed(1);
          //   // var total_amount_stripe = num.toFixed(0);
          //   var total_amount_stripe = num;

          //   if(trasaction.dataValues.payment_type == 0) {
          //   	let create_payout_json = {
	         //      "sender_batch_header": {
	         //        "sender_batch_id": sender_batch_id,
	         //        "email_subject": "You have a payment"
	         //      },
	         //      "items": [{
	         //        "recipient_type": "EMAIL",
	         //        "amount": {
	         //          "value": total_amount,
	         //          "currency": "AUD"
	         //        },
	         //        "receiver": venue.dataValues.paypal_id,
	         //        "note": "Thank you.",
	         //        "sender_item_id": "item_3"
	         //      }]
	         //    };

	         //    await paypal.payout.create(create_payout_json, async function (error, payout) {
	         //      if (error) {
	         //        console.log(error.response);
	         //        throw error;
	         //      } else {
	         //        console.log("Create Single Payout Response");
	         //        console.log(payout);
	         //        if (payout) {
	         //          trasaction.payout = 1;
	         //          trasaction.save();

	         //          const message = {
	         //            to: venue.dataValues.device_token,
	         //            collapse_key: '1',
	         //            // notification: {
	         //            //     title: 'You have received a payment',
	         //            //     body: 'You have received a payment of AUD ' + total_amount + ' ',
	         //            // },
	         //            data: {
	         //              notification_type: 2,
	         //              title: 'You have received a payment of AUD ' + total_amount + ' ',
          //               body: 'You have received a payment of AUD ' + total_amount + ' ',
          //               device_type:venue.dataValues.device_type
	         //            },
          //           };
          //           // if(venue.dataValues.device_type == 0){
          //           //   message.notification = {
          //           //     title: 'You have received a payment of AUD ' + total_amount + ' ',
          //           //     body: 'You have received a payment of AUD ' + total_amount + ' ',
          //           //   };
          //           // }
	         //          helpers.push_notification(message);
	         //        }
	         //        return;
	         //      }
	         //    });
          //   } else {
          //   	await stripe.transfers.create({
          //   		amount: total_amount_stripe,
          //   		currency: 'aud',
          //   		destination: venue.dataValues.account_id
          //   	}, async function(err, transfer) {
          //       if(err) {
          //         throw err;
          //       } else {
          //         if(transfer.id && transfer.object == "transfer") {
          //           trasaction.stripe_transfer_id = transfer.id;
          //           trasaction.payout = 1;
          //           trasaction.save();

          //           const message = {
          //             to: venue.dataValues.device_token,
          //             collapse_key: '1',
          //             // notification: {
          //             //     title: 'You have received a payment',
          //             //     body: 'You have received a payment of AUD ' + total_amount + ' ',
          //             // },
          //             data: {
          //               notification_type: 2,
          //               title: 'You have received a payment of AUD ' + total_amount_stripe + ' ',
          //               body: 'You have received a payment of AUD ' + total_amount_stripe + ' ',
          //               device_type:venue.dataValues.device_type
          //             },
          //           };
          //           // if(venue.dataValues.device_type == 0){
          //           //   message.notification = {
          //           //     title: 'You have received a payment of AUD ' + total_amount_stripe + ' ',
          //           //     body: 'You have received a payment of AUD ' + total_amount_stripe + ' ',
          //           //   };
          //           // }
          //           helpers.push_notification(message);
          //         }
          //         return;
          //       }
          //     });

          //   	// console.log(transfe_to_venue);
          //   	// return false;


          //   }


          // });
        }
        return responseHelper.post(res, trmnl);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async save_venue_categories(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.body.venue_id,
        category_id: req.body.category_id,
        // main_category_id: req.body.main_category_id,

        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        var chk_venue = await Venu.findOne({
          where: {
            id: requestdata.venue_id,
            // venue_id: requestdata.venue_id,
          }
        });
        if (!chk_venue) {
          throw "Invalid venue id."
        }
        let cat = requestdata.category_id.split(",");
        // let main_cat = requestdata.main_category_id.split(",");

        const categories = await Categories.findAll({
          where: {
            id: { $in: cat },
          }
        });

        if (categories.length > 0) {
          const save = await VenuCat.destroy({
            where: {
              venue_id: requestdata.venue_id,
            }
          });
          await Promise.all(categories.map(async c => {

            const save2 = await VenuCat.create({
              venue_id: requestdata.venue_id,
              category_id: c.dataValues.id,
              main_category_id: c.dataValues.main_category_id
            });
          }));
          return responseHelper.post(res, {});
        } else {
          return responseHelper.Error(res, {}, 'No such category found');
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async new_categories(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {

      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var cat = await MainCategory.findAll({
          include: [{
            model: Categories,
            where: {
              for_all: 1
            }
          }],
        });
        //console.log(cat);
        //return;
        if (cat) {
          await Promise.all(cat.map(async c => {
            // checking beverages category 
            const check_main_cat1 = await VenuCat.findOne({
              attributes: ['id'],
              where: {
                venue_id: requestdata.venue_id,
                main_category_id: 1
              }
            });
            if (check_main_cat1) {
              c.dataValues.isBeverages = 1
            } else {
              c.dataValues.isBeverages = 0
            }
            // checking food category
            const check_main_cat2 = await VenuCat.findOne({
              attributes: ['id'],
              where: {
                venue_id: requestdata.venue_id,
                main_category_id: 2
              }
            });
            if (check_main_cat2) {
              c.dataValues.isFood = 1
            } else {
              c.dataValues.isFood = 0
            }
            // checking that categories are selected by venue or not 
            await Promise.all(c.categories.map(async i => {
              const check_category = await VenuCat.findOne({
                attributes: ['id'],
                where: {
                  venue_id: requestdata.venue_id,
                  category_id: i.id
                }
              });
              if (check_category) {
                i.dataValues.is_selected = 1
              } else {
                i.dataValues.is_selected = 0
              }
              delete i.dataValues.venueId
              delete i.dataValues.venue_id
              delete i.dataValues.status
            }))
          }));
        }

        return responseHelper.get(res, cat);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async conclude_today_trade(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.body.venue_id,
        type: req.body.type,
        main_category_id: req.body.main_category_id,
      };
      const non_required = {
        terminal_id: req.body.terminal_id,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
     
      if (requestdata != "") {
        if (requestdata.type == 0) {
          
          const save = await Order.update({
            conclude_status: 1
          }, {
              where: {
                venue_id:requestdata.venue_id
              }
            });
          if (save) {
            const save2 = await OrderDetail.update({
              conclude_status: 1
            }, {
                where: {
                  venue_id:requestdata.venue_id
                }
              });
          }
          return responseHelper.post(res, {});
        }


        //For one terminal
        if (requestdata.type == 1) {
          
          const save = await Order.update({
            conclude_status: 1
          }, {
              where: {
                venue_id:requestdata.venue_id,
                terminal_id:requestdata.terminal_id
              }
            });
          if (save) {
            const save2 = await OrderDetail.update({
              conclude_status: 1
            }, {
              where: {
                venue_id:requestdata.venue_id,
                terminal_id:requestdata.terminal_id
              }
              });
          }
          return responseHelper.post(res, {});
        }

      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  // async conclude_today_trade(req, res) {
  //   try {
  //     const required = {
  //       security_key: req.headers.security_key,
  //       // venue_id: req.body.venue_id,
  //       order_id: req.body.order_id,
  //       //main_category_id: req.body.main_category_id,
  //     };
  //     const non_required = {
  //     };
  //     let requestdata = await helpers.vaildObject(required, non_required, res);
  //     if (requestdata != "") {

  //       let cat = requestdata.order_id.split(",");
  //       var chk_ordr = await Order.findAll({
  //         where: {
  //           id: { $in: cat },
  //         }
  //       });
  //       if (chk_ordr.length > 0) {
  //         // function to call today trade data
  //         /*   const data = {};
  //           data.main_category_id = requestdata.main_category_id;
  //           data.venue_id = requestdata.venue_id;
  //           const check = await receipt_for_today_trade(data);  */
  //         // fxn to send mail receipt
  //         // fxn ends
  //         const save = await Order.update({
  //           conclude_status: 1
  //         }, {
  //             where: {
  //               id: { $in: cat },
  //             }
  //           });
  //         if (save) {
  //           const save2 = await OrderDetail.update({
  //             conclude_status: 1
  //           }, {
  //               where: {
  //                 order_id: { $in: cat },
  //               }
  //             });
  //         }
  //         return responseHelper.post(res, {});
  //       } else {
  //         return responseHelper.Error(res, {}, 'No such order id found');
  //       }

  //     }
  //   } catch (err) {
  //     return responseHelper.onError(res, err, err);
  //   }
  // }
  async logout(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        table_name: 'venues',

        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const _logout = await Venu.update({ device_token: '', device_type: 0 }, {
          where: {
            id: requestdata.id
          }
        });
        if (_logout) {
          return responseHelper.post(res, {})
        }
      }
    } catch (e) {
      return responseHelper.onError(res, err, 'Error while logout');
    }
  }
  async check_venue_status(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = { terminal_id: req.query.terminal_id, user_id: req.query.user_id };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        let check_venue = await Venu.findOne({
          attributes: ['id', 'name', 'email', 'open'],
          where: {
            id: requestdata.venue_id,
            user_type: 0
          },
        });

        let terminal = await Terminal.findOne({
          attributes: ['table_number'],
          where: {
            id: requestdata.terminal_id
          }
        });
        check_venue.dataValues.table_number = 0
        if (terminal) {
          check_venue.dataValues.table_number = terminal.table_number
        }


        let check_is_suspended = await Suspend.count({
          where: {
            user_id: requestdata.user_id,
            venue_id: requestdata.venue_id,
            status: 1
          }
        });
        if (check_is_suspended) {
          check_venue.dataValues.suspend_by_venue = 1;
        } else {
          check_venue.dataValues.suspend_by_venue = 0;
        }

        if (requestdata.terminal_id) {

          let check_terminal = await Venu.findOne({
            attributes: ['id', 'terminal_id', 'name', 'email', 'open'],
            where: {
              terminal_id: requestdata.terminal_id,
            },
          });
          if (!check_terminal) {
            return responseHelper.Error(res, {}, 'Terminal not exist now');
          }
          check_venue.dataValues.is_terminal_open = check_terminal.open;
        }
        if (!check_venue) {
          return responseHelper.Error(res, {}, 'Venue not exist now');
        }
        return responseHelper.get(res, check_venue);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async terminal_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // main_category_id: req.query.main_category_id,
        user_id: req.query.user_id,
        venue_id: req.query.venue_id,
        date_timestamp: req.query.date_timestamp,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var productids = [];
        var conditons = {};
        var update_time = moment.unix(requestdata.date_timestamp).format("YYYY-MM-DD");

        // var to_time = parseInt(86400) + parseInt(requestdata.date_timestamp);
        // conditons.user_id = requestdata.user_id;
        // conditons.venue_id = requestdata.venue_id;
        // // conditons.main_category_id=requestdata.main_category_id;
        // // conditons.status=3;
        // conditons.createdAt = {
        //   $lte: to_time,
        //   $gte: requestdata.date_timestamp,
        // };
        /*  conditons.createdAt = {
        $lte: Math.floor(Date.now() / 1000),
    }; 
*/

        let Orders = await Order.findAll({
          attributes: ['createdAt', [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date']],
          include: [
            /* {
                                    model: Venu,
                                    attributes: [
                                        'id', 'name', 'image'
                                    ]
                                } */
            {
              model: Terminal,
              required:true,
              attributes: [
                'id', 'name',
              ]
            }
          ],
          group: ['terminal_id'],
          // group: [db.sequelize.col('`terminal.id`'), 'date'],

          order: [
            ['createdAt', 'DESC']
          ],
          where: database.Sequelize.literal((`date(FROM_UNIXTIME(createdAt)) = '${update_time}' and orders.venue_id='${requestdata.venue_id}'and orders.user_id='${requestdata.user_id}'`)),

        });
        // console.log(Orders);return;
        //console.log(Orders[0].dataValues.venue.dataValues.id);return;
        if (Orders && Orders.length > 0) {
          await Promise.all(Orders.map(async c => {
            let check = await Suspend.count({
              where: {
                user_id: requestdata.user_id,
                venue_id: requestdata.user_id,
                status: 1
              }
            });
            if (check) {
              c.dataValues.terminal.dataValues.is_suspended = 1
            } else {
              c.dataValues.terminal.dataValues.is_suspended = 0
            }
            var update_time = moment.unix(c.dataValues.createdAt).format("YYYY-MM-DD");
            let ready_orders_count = await Order.count({
              where: {
                // $or: [
                //   {
                //     status: 3
                //   },
                //   {
                //     status: 2
                //   }
                // ],
                // venue_id: requestdata.venue_id,
                // terminal_id: c.terminal.id,
                // user_id: requestdata.user_id,
                // createdAt: {
                //   $lte: to_time,
                //   $gte: requestdata.date_timestamp,
                // },
                where: database.Sequelize.literal((`(status = 3 or status = 2 or is_refunded = 1 and userBadgeSeen = 0) AND date(FROM_UNIXTIME(createdAt)) = '${update_time}' and user_id='${requestdata.user_id}' and venue_id='${requestdata.venue_id}' and orders.terminal_id='${c.terminal.id}'`)),

              }
            });
            if (ready_orders_count) {
              c.dataValues.terminal.dataValues.ready_orders_count = ready_orders_count
            } else {
              c.dataValues.terminal.dataValues.ready_orders_count = 0
            }
          }));
        }

        return responseHelper.get(res, Orders);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  /* new */
  async venue_order_count(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        // venue_id: req.query.venue_id,
        terminal_id: req.query.terminal_id,
      };
      const non_required = { main_category_id: req.query.main_category_id, venue_id: req.query.venue_id };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        var check_venue = {};
        if (requestdata.venue_id) {

          var check_venue = await Venu.findOne({
            attributes: ['id', 'name', 'email', 'avg_rating'],
            where: {
              id: requestdata.venue_id,
              user_type: 0
            }
          });
          if (!check_venue) {
            return responseHelper.Error(res, {}, 'Venue Not Found');
          }

        }
        let conditons = {};
        if (requestdata.main_category_id) {

          conditons.status = {
            // $in: [1, 2, 3]
            $in: [1]
          };
          conditons.terminal_id = requestdata.terminal_id;
          conditons.conclude_status = 0;
          conditons.main_category_id = requestdata.main_category_id;
        }
        else {
          conditons.status = {
            // $in: [1, 2, 3]
            $in: [1]
          };
          conditons.terminal_id = requestdata.terminal_id;
          conditons.conclude_status = 0;

        }
        const venue_order_count = await Order.findAndCountAll({
          where: conditons
          
        });

        delete conditons["status"];
        conditons.is_refunded = 1;
        conditons.venueBadgeSeen = 0;

        console.log(conditons);
        const refund_order_count = await Order.findAndCountAll({
          attributes:['id'],
          where:conditons
        });
        const final_data = {
          venue_detail: check_venue,
          order_count: venue_order_count.count,
          refund_order_count: refund_order_count.count
        }
        return responseHelper.get(res, final_data);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }

  async customer_order_ready_count(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        user_id: req.query.user_id,
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {

        let ready_orders_count = await Order.count({
          // where: {
          //   $or: [
          //     {
          //       status: 3
          //     },
          //     {
          //       status: 2
          //     }
          //   ],
          //   is_refunded:1,
          //   userBadgeSeen:0,
          //   user_id: requestdata.user_id
          // }

          where: database.Sequelize.literal((`(status = 3 or status=2 or  is_refunded = 1 and userBadgeSeen = 0) and user_id='${requestdata.user_id}'`)),
        });
        let finalResponse = {
          order_count: ready_orders_count
        }

        return responseHelper.get(res, finalResponse);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async venue_order_count_acc_to_categories(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const check_venue = await Venu.findOne({
          attributes: ['id', 'name', 'email', 'avg_rating'],
          where: {
            id: requestdata.venue_id,
            user_type: 0
          }
        });
        if (!check_venue) {
          return responseHelper.Error(res, {}, 'Venue Not Found');
        }
        const venue_order_count_for_beverage = await Order.findAndCountAll({
          where: {
            venue_id: requestdata.venue_id,
            status: {
              $in: [1, 2, 3]
            },
            main_category_id: 1
          },
          /*  include : [{
             model : MainCategory,
             attributes : ['title']
           }] */
        });
        const venue_order_count_for_food = await Order.findAndCountAll({
          where: {
            venue_id: requestdata.venue_id,
            status: {
              $in: [1, 2, 3]
            },
            main_category_id: 2
          },
          /*  include : [{
             model : MainCategory,
             attributes : ['title']
           }] */
        });
        const final_data = {
          venue_detail: check_venue,
          total_order_count: venue_order_count_for_beverage.count + venue_order_count_for_food.count,
          main_categories: [{
            title: 'Beverages',
            order_count: venue_order_count_for_beverage.count,
          },
          {
            title: 'Food',
            order_count: venue_order_count_for_food.count,
          }
          ]
        }
        return responseHelper.get(res, final_data);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async get_order_count_acc_to_cat(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        terminal_id: req.query.terminal_id,
        main_category_id: req.query.main_category_id, // 1 = Beverage , 2 = Food
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        let cat = await MainCategory.findOne({
          where: {
            id: requestdata.main_category_id
          }
        });
        if (!cat) {
          return responseHelper.Error(res, {}, 'Category not found');
        }
        const order_count = await Order.findAndCount({
          where: {
            terminal_id: requestdata.terminal_id,
            status: {
              $in: [1, 2, 3]
            },
            main_category_id: requestdata.main_category_id
          }
        });
        cat.dataValues.order_count = order_count.count
        return responseHelper.post(res, cat);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async terminal_open_close(req, res) {
    try {
      // console.log(req);
      // return;
      const required = {
        security_key: req.headers.security_key,

        terminal_id: req.body.terminal_id,
        type: req.body.type, // 0 = open , 1 = close
        // type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const trmnl = await Venu.findOne({
          attributes: ['terminal_id'],
          where: {
            terminal_id: requestdata.terminal_id,
            //user_type: 2
          }
        });
        if (!trmnl) {
          return responseHelper.Error(res, {}, 'Terminal not found');
        }
        const terminal_open = await Venu.update({
          open: requestdata.type
        }, {
            where: {
              terminal_id: requestdata.terminal_id,
              // user_type: 2
            }
          })
        return responseHelper.post(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  // function to send mail for venue order history list
  async send_receipt_for_venue_order_history(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
        main_category_id: req.query.main_category_id,
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const data = {};
        data.main_category_id = req.query.main_category_id;
        data.venue_id = req.query.venue_id;

        const check = await receipt_for_venue_order_history(data);
        if (check) {
          const venue = await Venu.findOne({
            attributes: ['id', 'email'],
            where: {
              id: req.query.venue_id
            }
          });
          // send receipt to email
          ejs.renderFile("/var/www/html/barmate/views/new_test.ejs", { response: check, date: dateTime }, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              var mail = {
                from: '"Barmate" admin@barmate.com',
                to: venue.dataValues.email,
                subject: 'Venue Order History Detail',
                html: data
              };
              helpers.send_mail(mail);
            }
          });
        }
        return responseHelper.get(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async cancel_order(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        order_id: req.body.order_id,
        reason: req.body.reason,
        cancelled_by: req.body.cancelled_by, // 1 = by venue , 2 = by user
      };
      const non_required = {
        paypal_id: req.body.paypal_id == undefined ? 0 : req.body.paypal_id,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        let payment_type = await Transactions.findOne({
          where: {
            order_id: requestdata.order_id
          }
        });

        if(payment_type) {
          // console.log(payment_type);
          // return false;

          if(payment_type.dataValues.payment_type == 0) {
            if (requestdata.cancelled_by == 2) {
              const check_order_status = await Order.findOne({
                attributes: ['id', 'venue_id', 'terminal_id', 'main_category_id', 'user_id', 'status', 'total'],
                where: {
                  id: requestdata.order_id,
                  status: 1 // pending order
                }
              });
              if (!check_order_status) {
                return responseHelper.Error(res, {}, 'Order can`t be cancelled now ');
              }
              // update paypal id 
              if (requestdata.paypal_id && requestdata.paypal_id != '') {

                var get_paypal_data = await User.findOne({
                  where: {
                    id: check_order_status.dataValues.user_id
                  }
                });
                const updt_paypal_id = await User.update({
                  paypal_id: get_paypal_data.dataValues.paypal_id
                }, {
                    where: {
                      id: check_order_status.dataValues.user_id
                    }
                  });
              }
              const check_user_paypal_id = await User.findOne({
                attributes: ['id'],
                where: {
                  id: check_order_status.dataValues.user_id,
                  paypal_id: {
                    $ne: ''
                  }
                }
              });
              /* if(check_user_paypal_id && check_user_paypal_id.dataValues.paypal_id == ''){
                return responseHelper.Error(res, {}, 'Please link your paypal account first');
              } */
              if (check_user_paypal_id) {
                const check_payment = await Transactions.findOne({
                  attributes: ['id', 'order_id', 'status', 'payout'],
                  where: {
                    order_id: requestdata.order_id,
                    // status: 'completed',
                    $or: [{
                      status: 'completed'
                    }, {
                      status: 'succeeded'
                    }],
                    payout: 0, // not yet transferred to venue
                  }
                });
                if (check_payment) {
                  //user detail
                  const venue = await Venu.findOne({
                    attributes: ['id', 'name', 'paypal_id', 'device_type', 'device_token'],
                    where: {
                      id: check_order_status.dataValues.user_id
                    }
                  });

                  //Terminal detail

                  const terminal = await Venu.findOne({
                    attributes: ['id', 'device_type', 'device_token'],
                    where: {
                      terminal_id: check_order_status.dataValues.terminal_id
                    }
                  });
                  let sender_batch_id = Math.random().toString(36).substring(9);
                  let create_payout_json = {
                    "sender_batch_header": {
                      "sender_batch_id": sender_batch_id,
                      "email_subject": "You have a payment"
                    },
                    "items": [{
                      "recipient_type": "EMAIL",
                      "amount": {
                        "value": check_order_status.dataValues.total,
                        "currency": "AUD"
                      },
                      "receiver": venue.dataValues.paypal_id,
                      "note": "Thank you.",
                      "sender_item_id": "item_3"
                    }]
                  };
                  await paypal.payout.create(create_payout_json, async function (error, payout) {
                    if (error) {
                      console.log(error.response);
                      // throw error;
                      return responseHelper.Error(res, {}, error);
                    } else {
                      console.log("Create Single Payout Response");
                      console.log(payout);
                      if (payout) {
                        const cancel_order = await Order.update({
                          status: 5, // for cancel,
                          cancellation_reason: requestdata.reason,
                          cancelled_by: requestdata.cancelled_by,// 1 = by venue , 2 = by user
                          is_refunded: 1 // 1 = refunded , 0 = not refunded
                        }, {
                            where: {
                              id: requestdata.order_id,
                            }
                          });
                          await OrderDetail.update({isCancelled:1},{where:{orderId:requestdata.order_id}});
                        const transaction = await Transactions.update({
                          payout: 2, // means payment refunded to user
                        }, {
                            where: {
                              order_id: check_order_status.dataValues.id,
                            }
                          });

                        if (venue.dataValues.device_token && venue.dataValues.device_token != '') {
                          const message = {
                            to: venue.dataValues.device_token,
                            collapse_key: '1',
                            // notification: {
                            //     title: 'Your Order has been cancelled',
                            //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                            // },
                            data: {
                              notification_type: 3,
                              title: 'Your Order has been cancelled , amount should be refunded to you soon',
                              body: 'Your Order has been cancelled , amount should be refunded to you soon',
                              order_id: check_order_status.dataValues.id,
                              venue_id: check_order_status.dataValues.venue_id,
                              device_type:venue.dataValues.device_type
                            },
                          }
                          // if(venue.dataValues.device_type == 0){
                          //   message.notification = {
                          //     title: 'Your Order has been cancelled , amount should be refunded to you soon',
                          //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                          //   };
                          // }
                          helpers.push_notification(message);
                        }
                        // send push to terminal
                        if (terminal.dataValues.device_token && terminal.dataValues.device_token != '') {
                          const terminal_message = {
                            to: terminal.dataValues.device_token,
                            collapse_key: '1',
                            // notification: {
                            //     title: 'Your Order has been cancelled',
                            //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                            // },
                            data: {
                              notification_type: 3,
                              title: 'Order is cancelled by ' + venue.dataValues.name,
                              body: 'Order is cancelled by ' + venue.dataValues.name,
                              order_id: check_order_status.dataValues.id,
                              venue_id: check_order_status.dataValues.venue_id,
                              main_category_id: check_order_status.dataValues.main_category_id,
                              device_type:terminal.dataValues.device_type
                            },
                          }
                          // if(terminal.dataValues.device_type == 0){
                          //   terminal_message.notification = {
                          //     title: 'Order is cancelled by ' + venue.dataValues.name,
                          //     body: 'Order is cancelled by ' + venue.dataValues.name,
                          //   };
                          // }
                          helpers.push_notification(terminal_message);
                        }
                        return responseHelper.post(res, payout);
                      }
                    }
                  });

                } else {
                  return responseHelper.Error(res, {}, 'Can`t cancel now, payment already transferred to venue');
                }
              } else {
                return responseHelper.Error(res, {}, 'Please link your paypal account first');
              }

            } else {
              // cancelled by venue
              //console.log('heelooooo'); return;
              /*  var check_order_statuss= await Order.findOne({
                   where:{
                       id:requestdata.order_id,
                   }
               });
     
               if(check_order_statuss.dataValues.status==4){
                return responseHelper.Error(res, {}, 'You Already Accepted the order');
                return;
     
               } */
              const check_order_status = await Order.findOne({
                attributes: ['id', 'venue_id', 'terminal_id', 'main_category_id', 'user_id', 'status', 'total'],
                where: {
                  id: requestdata.order_id,

                }
              });

              /*         console.log(check_order_status,"check_order_status");return; */
              if (check_order_status.dataValues.status == 4) {
                return responseHelper.Error(res, {}, 'Order can`t be cancelled now ');
              }
              // update paypal id 
              if (requestdata.paypal_id && requestdata.paypal_id != '') {
                var get_paypal_data = await User.findOne({
                  where: {
                    id: check_order_status.dataValues.user_id
                  }
                });
                const updt_paypal_id = await User.update({
                  paypal_id: get_paypal_data.dataValues.paypal_id
                }, {
                    where: {
                      id: check_order_status.dataValues.user_id
                    }
                  });
              }
              const check_user_paypal_id = await User.findOne({
                attributes: ['id'],
                where: {
                  id: check_order_status.dataValues.user_id,
                  paypal_id: {
                    $ne: ''
                  }
                }
              });
              /* if(check_user_paypal_id && check_user_paypal_id.dataValues.paypal_id == ''){
                return responseHelper.Error(res, {}, 'Please link your paypal account first');
              } */
              if (check_user_paypal_id) {
                /* const check_payment = await Transactions.findOne({
                    attributes: ['id', 'order_id', 'status', 'payout'],
                    where: {
                        order_id: requestdata.order_id,
                        status: 'completed',
                        payout: 0, // not yet transferred to venue
                    }
                }); */
                /*    if (check_payment) { */
                //user detail
                const venue = await Venu.findOne({
                  attributes: ['id', 'name', 'paypal_id', 'device_type', 'device_token'],
                  where: {
                    id: check_order_status.dataValues.user_id
                  }
                });


                let sender_batch_id = Math.random().toString(36).substring(9);
                let create_payout_json = {
                  "sender_batch_header": {
                    "sender_batch_id": sender_batch_id,
                    "email_subject": "You have a payment"
                  },
                  "items": [{
                    "recipient_type": "EMAIL",
                    "amount": {
                      "value": check_order_status.dataValues.total,
                      "currency": "AUD"
                    },
                    "receiver": venue.dataValues.paypal_id,
                    "note": "Thank you.",
                    "sender_item_id": "item_3"
                  }]
                };
                await paypal.payout.create(create_payout_json, async function (error, payout) {
                  if (error) {
                    console.log(error.response);
                    // throw error;
                    return responseHelper.Error(res, {}, error);
                  } else {
                    console.log("Create Single Payout Response");
                    console.log(payout);
                    if (payout) {
                      const cancel_order = await Order.update({
                        status: 5, // for cancel,
                        cancellation_reason: requestdata.reason,
                        cancelled_by: requestdata.cancelled_by,// 1 = by venue , 2 = by user
                        is_refunded: 1 // 1 = refunded , 0 = not refunded
                      }, {
                          where: {
                            id: requestdata.order_id,
                          }
                        });
                        await OrderDetail.update({isCancelled:1},{where:{orderId:requestdata.order_id}});
                      const transaction = await Transactions.update({
                        payout: 2, // means payment refunded to user
                      }, {
                          where: {
                            order_id: check_order_status.dataValues.id,
                          }
                        });

                      if (venue.dataValues.device_token && venue.dataValues.device_token != '') {
                        const message = {
                          to: venue.dataValues.device_token,
                          collapse_key: '1',
                          // notification: {
                          //     title: 'Your Order has been cancelled',
                          //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                          // },
                          data: {
                            notification_type: 3,
                            title: 'Venue canceled your order!',
                            body: 'Venue canceled your order!',
                            order_id: check_order_status.dataValues.id,
                            venue_id: check_order_status.dataValues.venue_id,
                            device_type:venue.dataValues.device_type
                          },
                        }
                        // if(venue.dataValues.device_type == 0){
                        //   message.notification = {
                        //     title: 'Venue canceled your order!',
                        //     body: 'Venue canceled your order!',
                        //   };
                        // }
                        helpers.push_notification(message);
                      }

                      return responseHelper.post(res, payout);
                    }
                  }
                });

                /* } else {
                    return responseHelper.Error(res, {}, 'Can`t cancel now, payment already transferred to venue');
                } */
              } else {
                return responseHelper.Error(res, {}, 'Please link your paypal account first');
              }

            }
          } else {
            if (requestdata.cancelled_by == 2) {
              const check_order_status = await Order.findOne({
                attributes: ['id', 'venue_id', 'terminal_id', 'main_category_id', 'user_id', 'status', 'total'],
                where: {
                  id: requestdata.order_id,
                  status: 1 // pending order
                }
              });
              if (!check_order_status) {
                return responseHelper.Error(res, {}, 'Order can`t be cancelled now ');
              }
              
              // const check_payment = await Transactions.findOne({
              //   attributes: ['id', 'order_id', 'status', 'payout','charge_id'],
              //   where: {
              //     order_id: requestdata.order_id,
              //     // status: 'completed',
              //     $or: [{
              //       status: 'completed'
              //     }, {
              //       status: 'succeeded'
              //     }],
              //     payout: 0, // not yet transferred to venue
              //   }
              // });

              const check_payment = await Transactions.findOne({
                attributes: ['id', 'order_id', 'status', 'payout','charge_id','stripe_transfer_id'],
                where: {
                  order_id: requestdata.order_id
                }
              });

              // console.log(check_payment);
              // return false;
              if (check_payment) {
                //user detail
                const venue = await Venu.findOne({
                  attributes: ['id', 'name', 'paypal_id', 'device_type', 'device_token'],
                  where: {
                    id: check_order_status.dataValues.user_id
                  }
                });

                //Terminal detail

                const terminal = await Venu.findOne({
                  attributes: ['id', 'device_type', 'device_token'],
                  where: {
                    terminal_id: check_order_status.dataValues.terminal_id
                  }
                });

                if(check_payment.dataValues.charge_id) {
                  if(check_payment.dataValues.stripe_transfer_id == 0 || check_payment.dataValues.stripe_transfer_id == '') {
                    return responseHelper.Error(res, {}, 'Cannot refund');
                  } else {
                    var retrieveTransfer = await stripe.transfers.retrieve(check_payment.dataValues.stripe_transfer_id);
                    var refund = await stripe.refunds.create({
                      charge: check_payment.dataValues.charge_id,
                      amount: retrieveTransfer.amount
                    });
                    var createReversal = await stripe.transfers.createReversal(check_payment.dataValues.stripe_transfer_id, {
                      amount: retrieveTransfer.amount
                    });
                  }

                  if(refund.id && refund.object == "refund" && refund.status == "succeeded") {
                    const cancel_order = await Order.update({
                        status: 5, // for cancel,
                        cancellation_reason: requestdata.reason,
                        cancelled_by: requestdata.cancelled_by,// 1 = by venue , 2 = by user
                        is_refunded: 1 // 1 = refunded , 0 = not refunded
                      }, {
                          where: {
                            id: requestdata.order_id,
                          }
                        });
                  await OrderDetail.update({isCancelled:1},{where:{orderId:requestdata.order_id}});
                    const transaction = await Transactions.update({
                        stripe_refund_id: refund.id,
                        payout: 2, // means payment refunded to user
                      }, {
                          where: {
                            order_id: check_order_status.dataValues.id,
                          }
                        });

                    if (venue.dataValues.device_token && venue.dataValues.device_token != '') {
                        const message = {
                          to: venue.dataValues.device_token,
                          collapse_key: '1',
                          // notification: {
                          //     title: 'Your Order has been cancelled',
                          //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                          // },
                          data: {
                            notification_type: 3,
                            title: 'Your Order has been cancelled , amount should be refunded to you soon',
                            body: 'Your Order has been cancelled , amount should be refunded to you soon',
                            order_id: check_order_status.dataValues.id,
                            venue_id: check_order_status.dataValues.venue_id,
                            device_type:venue.dataValues.device_type
                          },
                        }
                        // if(venue.dataValues.device_type == 0){
                        //   message.notification = {
                        //     title: 'Your Order has been cancelled , amount should be refunded to you soon',
                        //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                        //   };
                        // }
                        helpers.push_notification(message);
                      }

                      if (terminal.dataValues.device_token && terminal.dataValues.device_token != '') {
                        const terminal_message = {
                          to: terminal.dataValues.device_token,
                          collapse_key: '1',
                          // notification: {
                          //     title: 'Your Order has been cancelled',
                          //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                          // },
                          data: {
                            notification_type: 3,
                            title: 'Order is cancelled by ' + venue.dataValues.name,
                            body: 'Order is cancelled by ' + venue.dataValues.name,
                            order_id: check_order_status.dataValues.id,
                            venue_id: check_order_status.dataValues.venue_id,
                            main_category_id: check_order_status.dataValues.main_category_id,
                            device_type:terminal.dataValues.device_type
                          },
                        }
                        // if(terminal.dataValues.device_type == 0){
                        //   terminal_message.notification = {
                        //     title: 'Order is cancelled by ' + venue.dataValues.name,
                        //     body: 'Order is cancelled by ' + venue.dataValues.name,
                        //   };
                        // }
                        helpers.push_notification(terminal_message);
                      }

                      return responseHelper.post(res, refund);
                  } else {
                    // throw "Refund error";
                    return responseHelper.Error(res, {}, 'Refund error');
                  }
                } else {
                  // throw "No charge";
                  return responseHelper.Error(res, {}, 'No charge');
                }

              } else {
                // return responseHelper.Error(res, {}, 'Can`t cancel now, payment already transferred to venue');
                return responseHelper.Error(res, {}, 'Order not found');
              }

            } else {
              // cancelled by venue
              //console.log('heelooooo'); return;
              /*  var check_order_statuss= await Order.findOne({
                   where:{
                       id:requestdata.order_id,
                   }
               });
     
               if(check_order_statuss.dataValues.status==4){
                return responseHelper.Error(res, {}, 'You Already Accepted the order');
                return;
     
               } */
              const check_order_status = await Order.findOne({
                attributes: ['id', 'venue_id', 'terminal_id', 'main_category_id', 'user_id', 'status', 'total'],
                where: {
                  id: requestdata.order_id,

                }
              });

              /*         console.log(check_order_status,"check_order_status");return; */
              if (check_order_status.dataValues.status == 4) {
                return responseHelper.Error(res, {}, 'Order can`t be cancelled now ');
              }

              const check_payment = await Transactions.findOne({
                attributes: ['id', 'order_id', 'status', 'payout','charge_id','stripe_transfer_id'],
                where: {
                  order_id: requestdata.order_id
                }
              });

              const venue = await Venu.findOne({
                attributes: ['id', 'name', 'paypal_id', 'device_type', 'device_token'],
                where: {
                  id: check_order_status.dataValues.user_id
                }
              });

              if(check_payment.dataValues.charge_id) {
                if(check_payment.dataValues.stripe_transfer_id == 0 || check_payment.dataValues.stripe_transfer_id == '') {
                  return responseHelper.Error(res, {}, 'Cannot refund');
                } else {
                  var retrieveTransfer = await stripe.transfers.retrieve(check_payment.dataValues.stripe_transfer_id);
                  var refund = await stripe.refunds.create({
                    charge: check_payment.dataValues.charge_id,
                    amount: retrieveTransfer.amount
                  });
                  var createReversal = await stripe.transfers.createReversal(check_payment.dataValues.stripe_transfer_id, {
                    amount: retrieveTransfer.amount
                  });
                }

                if(refund.id && refund.object == "refund" && refund.status == "succeeded") {
                  const cancel_order = await Order.update({
                      status: 5, // for cancel,
                      cancellation_reason: requestdata.reason,
                      cancelled_by: requestdata.cancelled_by,// 1 = by venue , 2 = by user
                      is_refunded: 1 // 1 = refunded , 0 = not refunded
                    }, {
                        where: {
                          id: requestdata.order_id,
                        }
                      });

                  await OrderDetail.update({isCancelled:1},{where:{orderId:requestdata.order_id}});

                  const transaction = await Transactions.update({
                    stripe_refund_id: refund.id,
                      payout: 2, // means payment refunded to user
                    }, {
                        where: {
                          order_id: check_order_status.dataValues.id,
                        }
                      });

                  if (venue.dataValues.device_token && venue.dataValues.device_token != '') {
                      const message = {
                        to: venue.dataValues.device_token,
                        collapse_key: '1',
                        // notification: {
                        //     title: 'Your Order has been cancelled',
                        //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                        // },
                        data: {
                          notification_type: 3,
                          title: 'Your Order has been cancelled , amount should be refunded to you soon',
                          body: 'Your Order has been cancelled , amount should be refunded to you soon',
                          order_id: check_order_status.dataValues.id,
                          venue_id: check_order_status.dataValues.venue_id,
                          device_type:venue.dataValues.device_type
                        },
                      }
                      // if(venue.dataValues.device_type == 0){
                      //   message.notification = {
                      //     title: 'Your Order has been cancelled , amount should be refunded to you soon',
                      //     body: 'Your Order has been cancelled , amount should be refunded to you soon',
                      //   };
                      // }
                      helpers.push_notification(message);
                    }

                    return responseHelper.post(res, refund);
                } else {
                  // throw "Refund error";
                  return responseHelper.Error(res, {}, 'Refund error');
                }
              } else {
                // throw "No charge";
                return responseHelper.Error(res, {}, 'No charge');
              }

            }
          }
        } else {
            return responseHelper.Error(res, {}, 'Transaction not found');
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }

  async user_refund(req, res) {
    try {

      const required = {
        security_key: req.headers.security_key,
        order_id: req.body.order_id,
      };
      const non_required = {
        paypal_id: req.body.paypal_id == undefined ? 0 : req.body.paypal_id,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);

      if (requestdata != "") {
        const order = await Order.findOne({
          where: {
            id: requestdata.order_id
          },
          attributes: ['id', 'user_id', 'total']
        })
        // update paypal id 
        if (requestdata.paypal_id && requestdata.paypal_id != '') {
          const updt_paypal_id = await User.update({
            paypal_id: requestdata.paypal_id
          }, {
              where: {
                id: order.user_id
              }
            });
        }
        const check_user_paypal_id = await User.findOne({
          attributes: ['id'],
          where: {
            id: order.user_id,
            paypal_id: {
              $ne: ''
            }
          }
        });
        /* if(check_user_paypal_id && check_user_paypal_id.dataValues.paypal_id == ''){
          return responseHelper.Error(res, {}, 'Please link your paypal account first');
        } */
        if (check_user_paypal_id) {
          const venue = await Venu.findOne({
            attributes: ['id', 'paypal_id', 'device_type', 'device_token'],
            where: {
              id: order.user_id
            }
          });
          let sender_batch_id = Math.random().toString(36).substring(9);
          let create_payout_json = {
            "sender_batch_header": {
              "sender_batch_id": sender_batch_id,
              "email_subject": "You have a payment"
            },
            "items": [{
              "recipient_type": "EMAIL",
              "amount": {
                "value": order.total,
                "currency": "AUD"
              },
              "receiver": venue.dataValues.paypal_id,
              "note": "Thank you.",
              "sender_item_id": "item_3"
            }]
          };
          await paypal.payout.create(create_payout_json, async function (error, payout) {
            if (error) {
              console.log(error.response);
              // throw error;
              return responseHelper.Error(res, {}, error);
            } else {
              console.log("Create Single Payout Response");
              console.log(payout);
              if (payout) {
                const order_refund = await Order.update({
                  is_refunded: 1 // 1 = refunded , 0 = not refunded
                }, {
                    where: {
                      id: requestdata.order_id,
                    }
                  });
                const transaction = await Transactions.update({
                  payout: 2, // means payment refunded to user
                }, {
                    where: {
                      order_id: order.id
                    }
                  });
                if (venue.dataValues.device_token && venue.dataValues.device_token != '') {
                  const message = {
                    to: venue.dataValues.device_token,
                    collapse_key: '1',

                    data: {
                      notification_type: 3,
                      title: 'Your Refund request submitted successfully , amount should be refunded to you soon',
                      body: 'Your Refund request submitted successfully , amount should be refunded to you soon',
                      order_id: requestdata.order_id,
                      venue_id: req.body.venue_id,
                      device_type:venue.dataValues.device_type
                    },
                  }
                  // if(venue.dataValues.device_type == 0){
                  //   message.notification = {
                  //     title: 'Your Refund request submitted successfully , amount should be refunded to you soon',
                  //     body: 'Your Refund request submitted successfully , amount should be refunded to you soon',
                  //   };
                  // }
                  helpers.push_notification(message);
                }
                return responseHelper.post(res, payout);
              }
            }
          });


        } else {
          return responseHelper.Error(res, {}, 'Please link your paypal account first');
        }

      }

    }
    catch (err) {
      return responseHelper.onError(res, err, 'Error in Refund Process');
    }
  }

  async rate_venue(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.body.venue_id, // 
        user_id: req.body.user_id, //
        order_id: req.body.order_id,
        //comment: req.body.comment,
        rating: req.body.rating,
      };
      const non_required = {
        comment: req.body.comment == undefined ? 0 : req.body.comment,
      };
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const check_already_rated = await VenueReviews.findOne({
          attributes: ['id'],
          where: {
            review_to: requestdata.venue_id,
            review_by: requestdata.user_id,
            order_id: requestdata.order_id
          },
        });
        if (check_already_rated) {
          return responseHelper.Error(res, {}, 'You have already rated this venue');
        }
        const submit_review = await VenueReviews.create({
          review_to: requestdata.venue_id,
          review_by: requestdata.user_id,
          comment: requestdata.comment,
          rating: requestdata.rating,
          order_id: requestdata.order_id,
        });
        if (submit_review) {
          const get_avg_rating = await VenueReviews.findAll({
            attributes: [
              [Sequelize.fn('AVG', Sequelize.col('rating')), 'total']
            ],
            where: {
              review_to: requestdata.venue_id,
            }
          });
          // console.log(get_avg_rating); 
          let avg_rating = (Math.round(get_avg_rating[0].dataValues.total * 100) / 100).toFixed(0);

          await Venu.update({
            avg_rating: avg_rating
          }, {
              where: {
                id: requestdata.venue_id,
              }
            });
          return responseHelper.post(res, submit_review);
        }
      }
    } catch (err) {
      console.log(err);
      return responseHelper.onError(res, err, 'Error in providing review to venue');
    }
  }
  async ad_listing(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const get_ads = await Ads.findAll({
          attributes: ['id', 'title', 'description', 'media', 'link', 'createdAt'],
          where: {
            venue_id: requestdata.venue_id
          },
          order: [
            [Sequelize.fn('RAND')]
          ]
        });
        return responseHelper.get(res, get_ads);
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }
  async receipt_of_customer_order_detail(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
        date_timestamp: req.query.date_timestamp,
        terminal_id: req.query.terminal_id,
        //main_category_id: req.query.main_category_id,
        user_id: req.query.user_id,
        type: req.query.type,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        if (requestdata.type == 1) { // for today customers
          //var conditons = {};
          let conditons = {};
          conditons.venue_id = requestdata.venue_id;
          // conditons.id=requestdata.order_id;
          conditons.user_id = requestdata.user_id;
          // conditons.cancelled_by = 0;
          //conditons.main_category_id = requestdata.main_category_id;
          conditons.conclude_status = 0
          if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
            var t_t = parseInt(requestdata.date_timestamp);
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.createdAt = {
              $lte: to_time,
              $gte: t_t
            };
            conditons.terminal_id = requestdata.terminal_id
          }
          let Orders = await Order.findAll({
            include: [{
              model: OrderDetail,
              attributes: ['quantity', 'price', 'instructions', 'size', 'product_name'],
              include: {
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],

              }
            },],
            where: conditons,
            order: [
              ['id', 'ASC'],
              [db.sequelize.col('`orderDetails->product`.`name`'), 'ASC'],

            ],
          });
          /* delete conditons.createdAt;
          conditons.timestamp = {
              $lte: to_time,
              $gte: t_t
          }; */
          let final = {};
          if (Orders) {
            final.rounds = Orders;
            //var order_ids = [];
            let order_ids = [];
            for ( /* var order of Orders */ let order of Orders) {
              let check = await Suspend.count({
                where: {
                  user_id: requestdata.user_id,
                  venue_id: requestdata.venue_id,
                  status: 1
                }
              });
              if (check) {
                order.dataValues.suspend = 1;
              } else {
                order.dataValues.suspend = 0;
              }
              order_ids.push(order.dataValues.id);
            }
            let quantities = await OrderDetail.findAll({
              attributes: ['size', 'product_name', 'price',
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total'],
                [db.sequelize.literal(" (sum(`orderDetails`.`price` * `orderDetails`.`quantity`))"), 'total_price']

              ],
              include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }],
              group: ['product_id'],
              where: {
                order_id: {
                  $in: order_ids
                },
                isCancelled:0
              },
            });
            final.quantities = quantities;
            const get_Venue = await Venu.findOne({
              attributes: ['id', 'name', 'email', 'image', 'avg_rating', 'phone', 'fax', 'abn'],
              where: {
                id: requestdata.venue_id
              }
            });
            // receipt 
            if (get_Venue) {
              get_Venue.dataValues.receipt_no = parseInt(requestdata.date_timestamp);
            }
            final.venueDetail = get_Venue ? get_Venue : {}
          }
          return responseHelper.get(res, final);
        } else { // for all customers
          //var conditons = {};
          let conditons = {};
          conditons.venue_id = requestdata.venue_id;
          // conditons.id=requestdata.order_id;
          conditons.user_id = requestdata.user_id;
          // conditons.cancelled_by = 0;
          conditons.terminal_id = requestdata.terminal_id
          //conditons.main_category_id = requestdata.main_category_id;
          //conditons.conclude_status = 0
          if (requestdata.date_timestamp && requestdata.date_timestamp.length > 0 && requestdata.date_timestamp != '') {
            var t_t = parseInt(requestdata.date_timestamp);
            var to_time = parseInt(86400) + parseInt(t_t);
            conditons.createdAt = {
              $lte: to_time,
              $gte: t_t
            };
          }
          let Orders = await Order.findAll({
            include: [{
              model: OrderDetail,
              attributes: ['quantity', 'price', 'size', 'product_name'],
              include: {
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }
            },],

            order: [
              ['id', 'ASC'],
              [db.sequelize.col('`orderDetails->product`.`name`'), 'ASC'],
            ],
            where: conditons,

          });
          /*  delete conditons.createdAt;
           conditons.timestamp = {
               $lte: to_time,
               $gte: t_t
           }; */
          let final = {};
          if (Orders) {
            final.rounds = Orders;
            // var order_ids = [];
            let order_ids = [];
            for ( /* var order of Orders */ let order of Orders) {
              let check = await Suspend.count({
                where: {
                  user_id: requestdata.user_id,
                  venue_id: requestdata.venue_id,
                  status: 1
                }
              });
              if (check) {
                order.dataValues.suspend = 1;
              } else {
                order.dataValues.suspend = 0;
              }
              order_ids.push(order.dataValues.id);
            }
            let quantities = await OrderDetail.findAll({
              attributes: ['size', 'product_name', 'price',
                [db.sequelize.literal("(sum(`orderDetails`.`quantity`))"), 'quantity_total'],
                [db.sequelize.literal(" (sum(`orderDetails`.`price` * `orderDetails`.`quantity`))"), 'total_price']
              ],
              include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image', 'description', 'quantity'],
              }],
              group: ['product_id'],
              where: {
                order_id: {
                  $in: order_ids
                },
                isCancelled:0
              }
            });
            final.quantities = quantities;
            const get_Venue = await Venu.findOne({
              attributes: ['id', 'name', 'email', 'image', 'avg_rating', 'phone', 'fax', 'abn'],
              where: {
                id: requestdata.venue_id
              }
            });
            // receipt 
            if (get_Venue) {
              // get_Venue.dataValues.receipt_no = parseInt(new Date().getTime());
              get_Venue.dataValues.receipt_no = parseInt(1591100+order_ids.slice(-1)[0]);
            }
            final.venueDetail = get_Venue ? get_Venue : {}

          }
          return responseHelper.get(res, final);
        }
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }

  // send receipt for customer order detail
  async send_receipt_for_customer_order_detail(req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        venue_id: req.query.venue_id,
        date_timestamp: req.query.date_timestamp,
        user_id: req.query.user_id,
        type: req.query.type,
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      if (requestdata != "") {
        const data = {};
        data.date_timestamp = req.query.date_timestamp;
        data.venue_id = req.query.venue_id;
        data.user_id = req.query.user_id;
        data.type = req.query.type; // 

        const check = await receipt_of_customer_order_detail(data);
        if (check) {
          const user = await Venu.findOne({
            attributes: ['id', 'email'],
            where: {
              id: req.query.user_id
            }
          });
          // send receipt to email
          ejs.renderFile("/var/www/html/barmate/views/new_test.ejs", { response: check, date: dateTime }, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              var mail = {
                from: '"Barmate" admin@barmate.com',
                to: user.dataValues.email,
                subject: 'User Order Detail',
                html: data
              };
              helpers.send_mail(mail);
            }
          });
        }
        return responseHelper.get(res, {});
      }
    } catch (err) {
      return responseHelper.onError(res, err, err);
    }
  }

  async send_venue_receipt_for_order_history(req, res) {

    try {

      // const required = {
      //     security_key: req.headers.security_key,
      //     main_category_id: req.query.main_category_id,
      //     venue_id: req.query.venue_id,

      //     trade_type: req.query.trade_type, // 1= for all terminals 0 = terminal wise
      //     type: req.query.type, // 0 = today trade , 1 = history
      //     table_name: 'venues',
      //     checkexit: 2
      // };
      // const non_required = {
      //     timestamp: req.query.timestamp == undefined ? 0 : req.query.timestamp,
      //     terminal_id: req.query.terminal_id,
      // };


      ejs.renderFile("/var/www/html/barmate/views/venue_order_history_receipt.ejs", { response: req.body.body }, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var mail = {
            from: '"Barmate" admin@barmate.com',
            to: req.body.body.reciever_email,
            // to: "gaurav.cqlsys@gmail.com",
            subject: 'Venue Order History Detail',
            html: data
          };
          helpers.send_mail(mail);
        }
      });


      return res.json({
        code: 200,
        message: "Receipt Sent Successfully!",
      })


    }
    catch (err) {
      return responseHelper.onError(res, err, err);
    }

  }


  async send_customer_order_detail_receipt(req, res) {

    try {
      var num = parseFloat(req.body.tbmPrice);
      var n = num.toFixed(2);
      req.body.tbmPrice = n;

      ejs.renderFile("/var/www/html/barmate/views/customer_order_detail_receipt.ejs", { response: req.body.body }, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var mail = {
            from: '"Barmate" admin@barmate.com',
            to: req.body.body.reciever_email,
            // to: "gaurav.cqlsys@gmail.com",
            subject: 'Order Detail',
            html: data
          };
          helpers.send_mail(mail);
        }
      });


      return res.json({
        code: 200,
        message: "Receipt Sent Successfully!",
      })


    }
    catch (err) {
      return responseHelper.onError(res, err, err);
    }

  }

  async refunded_order_list(req,res){
     try{
      const required = {
       security_key: req.headers.security_key,
        // venue_id: req.query.venue_id,
        main_category_id: req.query.main_category_id,
        terminal_id: req.query.terminal_id,
        table_name: 'venues',
        checkexit: 2
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      
      // console.log(requestdata,"requestdata")
                
        var Orders = await Order.findAll({
          include: [{
            model: User,
            as: 'userDetails',
            attributes: [
              'id', 'name', 'image'
            ]
          }],
          order: [
            ['id']
          ],
          where:{
            status:5,
            is_refunded:1,
            main_category_id:requestdata.main_category_id,
            terminal_id:requestdata.terminal_id

          }
        });
        //  console.log(Orders,"Orders==========");return
        if (Orders && Orders.length > 0) {
          for (let c in Orders) {
            Orders[c].dataValues.order_number = parseInt(c) + 1;
          }
        }
        await Order.update({
          venueBadgeSeen:1
        },{
          where:{
            status:5,
            is_refunded:1,
            main_category_id:requestdata.main_category_id,
            terminal_id:requestdata.terminal_id
          }
        })
        return responseHelper.get(res, Orders);
     }catch(err){
       throw err
     }
  }

  async get_connected_account_email(req,res){
     try{
      const required = {
       security_key: req.headers.security_key,
        userId: req.body.userId,
      };
      const non_required = {};
      let requestdata = await helpers.vaildObject(required, non_required, res);
      
      // console.log(requestdata,"requestdata")
                
      var findUser = await Venu.findOne({
        where: {
          id: requestdata.userId
        }
      });

      if(findUser) {
        findUser = findUser.toJSON();

        var accountId = findUser.account_id;

        if(accountId == 0) {
          return responseHelper.Error(res, {}, "No account connected");
        } else {
          await stripe.accounts.retrieve(
            accountId,
            async function(err, account) {
              // asynchronously called
              if(err) {
                return responseHelper.Error(res, {}, "Error fetching email...Please try again");
              } else {
                return responseHelper.get(res, { "email": account.email });
              }
            }
          );
        }
      } else {
        return responseHelper.Error(res, {}, "User id is wrong");
      }

     }catch(err){
       throw err
     }
  }


  async get_test_webhook(req,res){
     try{
        console.log(req.body, '=----------------->get_test_webhook_data');
        
        
        let data = JSON.stringify(req.body);
        
      
        await WebhookData.create({
          data
        });
        return responseHelper.get(res, {});

     }catch(err){
       throw err
     }
  }

  async get_refund_data(req,res){
     try{



      let num = (2.30 - 0.30).toFixed(1);
      num = parseFloat(num);
      console.log(num,'----------------------------')
            num = (num - (0.0175 * 2.30)).toFixed(2);
            num = parseFloat(num)
            console.log(num,'----------------------------')

            num = (num - (0.0325 * num)).toFixed(2);
            num = parseFloat(num)

            console.log(num,'----------------------------')
        
        
        // await stripe.refunds.retrieve(
        //   're_1GxosjEa2iWMvJ1vdgF9dtuX',
        //   async function(err, refund) {
        //     // asynchronously called
        //     console.log(refund)
        //   }
        // );

        // await stripe.accounts.retrieve(
        //   'acct_1Gx8s2CmptljNgja',
        //   async function(err, account) {
        //     // asynchronously called
        //     console.log(account)
        //   }
        // );

        stripe.balance.retrieve(function(err, balance) {
        	console.log(balance)
        	// console.log(balance.available);
        	// console.log(balance.pending)
		  // asynchronously called
		});

		// await stripe.transfers.create({
  //           		amount: 190,
  //           		currency: 'aud',
  //           		destination: 'acct_1Gx8s2CmptljNgja'
  //           	}, async function(err, transfer) {
  //               if(err) {
  //                 throw err;
  //               } else {
  //                 console.log(transfer)
  //               }
  //             });

     }catch(err){
       throw err
     }
  }
  
}