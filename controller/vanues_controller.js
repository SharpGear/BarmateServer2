const db = require('../models');
// const db = page.orders;
const dateTime = require('node-datetime');

const sequelize = require('sequelize');
const vanue = db.venues;
const pro = db.products;
const MainCategory = db.mainCategory;
const cate = db.categories;
const sub_catt = db.subcategories;
const Terminal = db.terminals;
const VenueIntegration = db.venue_integration;
const VenuCat = db.venue_categories;
const orders = db.orders;
const orderDetails = db.orderDetails;
const apihelper = require('../helper/apihelper.js');
pro.belongsTo(MainCategory, { foreignKey: 'main_category_id' });
pro.belongsTo(cate, { foreignKey: 'category_id' });
pro.belongsTo(sub_catt, { foreignKey: 'subcategory_id' });
const helper = require('../helper/');
let Sequelize = require('sequelize');
let Op = Sequelize.Op;
const password = helper.crypt;
const fileupload = helper.file_upload;
const constant = require('../config/constant');

orders.belongsTo(vanue, { foreignKey: 'venue_id' });
orders.belongsTo(vanue, { foreignKey: 'user_id', as: 'usersDetail' });
orders.belongsTo(Terminal, { foreignKey: 'terminal_id' });
orderDetails.belongsTo(vanue, { foreignKey: 'venue_id' });
orderDetails.belongsTo(vanue, { foreignKey: 'user_id', as: 'usersDetail' });
orderDetails.belongsTo(Terminal, { foreignKey: 'terminal_id' });
orderDetails.belongsTo(pro, { foreignKey: 'product_id' });
orderDetails.belongsTo(orders, { foreignKey: 'order_id' });
var fs = require("fs");
var nodemailer = require("nodemailer");
var ejs = require("ejs");
const helpers = new apihelper();
const axios = require('axios');
const Product = db.products;
const AdminProduct = db.admin_products;
const UUID = require('uuid');
const KountaManager = require('../classes/KountaManager');
const SwiftManager = require('../classes/SwiftManager');


module.exports = {
    vanues_list: async function(req, res) {
        try {
            if (req.session.auth && req.session.auth == true) {
                var results;
                if (req.query.start && req.query.end) {
                    let start_date = req.query.start;
                    let end_date = req.query.end;

                    var conditions = {};
                    conditions.createdAt = {
                        $lte: end_date,
                        $gte: start_date,
                    };
                    conditions.user_type = 0
                    var results = await vanue.findAll({
                        /*   where: {
                              createdAt: {
                                  [Op.between]: [req.query.start, req.query.end]
                              },
                              user_type: 0,
                          }, */
                        where: conditions,
                        order: [
                            ['id', 'DESC']
                        ],
                    });
                    /*  Promise.all(results.map((x) => {
                         var year = new Date(x.createdAt).getFullYear();
                         var month = new Date(x.createdAt).getMonth() + 1;
                         var date = new Date(x.createdAt).getDate();
                         x.time = year + '-' + month + '-' + date;

                         return x;
                     })).then((data) => { */

                    res.render('venue/list', { response: results, msg: req.flash('msg'), title: 'venue' });
                    //});
                } else {
                    var results = await vanue.findAll({
                        where: {
                            user_type: 0
                        },
                        order: [
                            ['id', 'DESC']
                        ],
                    });
                    /*  Promise.all(results.map((x) => {
                         var year = new Date(x.createdAt).getFullYear();
                         var month = new Date(x.createdAt).getMonth() + 1;
                         var date = new Date(x.createdAt).getDate();
                         x.time = year + '-' + month + '-' + date;

                         return x;
                     })).then((data) => { */

                    res.render('venue/list', { response: results, msg: req.flash('msg'), title: 'venue' });
                    //});
                }
            } else {
                req.flash('msg', "please login first");
                res.redirect('/');
            }
        } catch (e) {
            throw e;
        }
    },
    edit_vanue: async function(req, res) {
        try {
            if (req.session.auth && req.session.auth == true) {
                const find_user = await vanue.findAll({
                    where: {
                        id: req.query.id
                    }
                });
                res.render('venue/editvanue', { response: find_user, title: 'venue' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },
    createVenue: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                res.render('venue/addvanue', { response: '', title: 'venue' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },
    add_vanue: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                const crypt = password(req.body.password);
                const data = constant.image_url + fileupload(req.files.image);
                const results = await vanue.create({
                    name: req.body.name,
                    email: req.body.email,
                    image: data,
                    password: crypt,
                    user_type: 0
                });
                if (results) {
                    const main_trmnl = await Terminal.create({
                        venue_id: results.dataValues.id,
                        name: 'Main',
                        is_main: 1,
                        status: 1,
                        main_category: 3, // default both main categories

                    });
                    if (main_trmnl) {
                        const ven_main_termnl = await vanue.update({
                                terminal_id: main_trmnl.dataValues.id
                            }, {
                                where: {
                                    id: results.dataValues.id,
                                }
                            }

                        );
                    }
                    // default categories to venue
                    const categories = await cate.findAll({
                        attributes: ['id', 'main_category_id']
                    });

                    if (categories) {
                        await Promise.all(categories.map(async c => {

                            const save2 = await VenuCat.create({
                                venue_id: results.dataValues.id,
                                category_id: c.dataValues.id,
                                main_category_id: c.dataValues.main_category_id
                            });
                        }));
                    }

                }
                req.flash('msg', "venue added successfully")
                res.redirect('/vanue');
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },
    update_vanue: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                const findvenue = await vanue.findAll({
                    where: { id: req.body.id }
                });
                if (findvenue) {
                    let files = '';
                    if (req.files && req.files != '' && req.files.image && req.files.image != '') {
                        files = constant.image_url + fileupload(req.files.image);
                    } else {
                        files = findvenue[0].dataValues.image;
                    }
                    const update_venue = await vanue.update({
                        name: req.body.name,
                        image: files,
                        //email: req.body.email,
                    }, { where: { id: findvenue[0].dataValues.id } });
                    if (update_venue) {
                        req.flash('msg', "venue updated successfully")
                        res.redirect('/vanue');
                    }
                }
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },
    update_status_venue: async(req, res) => {
        try {
            let up_status = (req.body.status == 1) ? 0 : 1;

            const results = await vanue.update({
                status: up_status,
            }, { where: { id: req.body.id } });
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
    product_list: async function(req, res) {
        //console.log(req.query);return;
        try {
            if (req.session.auth && req.session.auth == true) {
                const ven = await vanue.findOne({
                    attributes: ['name'],
                    where: {
                        id: req.query.id
                    }
                });
                //console.log(ven); return;
                if (ven) {
                    const results = await pro.findAll({
                        order: [
                            ['id', 'DESC']
                        ],
                        include: [{
                                model: cate,
                                attributes: [
                                    'name'
                                ]
                            },
                            {
                                model: sub_catt,
                                attributes: [
                                    'name'
                                ]
                            },
                            {
                                model: MainCategory,
                                attributes: [
                                    'title'
                                ]
                            },
                        ],
                        where: {
                            venue_id: req.query.id,
                            is_deleted: 0
                        },
                        // group: ['admin_product_id']

                    });

                    // res.send(results)

                    res.render('venue/product_list', { response: results, _venue: ven, title: "venue" })
                }

            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (e) {
            throw e;
        }
    },
    venue_sale_data: async function(req, res) {
        try {
            if (req.session.auth && req.session.auth == true) {
                // console.log(req.query); return;
                let data = req.query.id;
                const ven = await vanue.findOne({
                    attributes: ['name'],
                    where: {
                        id: data
                    }
                });
                if (ven) {
                    const order_date = await orders.findAll({
                        attributes: ['venue_id', 'createdAt', [db.sequelize.literal("(SELECT DATE_FORMAT(FROM_UNIXTIME(`createdAt`), '%d-%m-%Y'))"), 'date'],
                            [db.sequelize.fn('SUM', sequelize.col('total')), 'total_amount']
                        ],
                        where: {
                            venue_id: data
                        },
                        group: ['date'],
                        order: [
                            [
                                'id', 'DESC'
                            ]
                        ]
                    });

                    res.render('venue/order_date_list', { response: order_date, _venue: ven, title: "venue" });
                } else {
                    res.render('venue/order_date_list', { response: '', _venue: '', title: "venue" });
                }

            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (e) {
            throw e;
        }
    },
    get_sale_data_by_date: async function(req, res) {
        try {
            if (req.session.auth && req.session.auth == true) {
                let data = req.query;
                const ven = await vanue.findOne({
                    attributes: ['name'],
                    where: {
                        id: data.venue_id
                    }
                });

                var conditons = {};
                var date = new Date().getDate();
                var month = new Date().getMonth();
                var year = new Date().getFullYear();
                var monthDateYear = (month + 1) + "-" + date + "-" + year;
                var t = new Date(monthDateYear);
                var t_t = (t.getTime()) / 1000;
                // add one day timestamp 

                // console.log(data.timestamp); return;

                var myDate = data.timestamp;
                myDate = myDate.split("-");
                var newDate = myDate[1] + "/" + myDate[0] + "/" + myDate[2];
                //alert(new Date(newDate).getTime()); 
                //console.log(new Date(newDate).getTime()); return;
                const new_timestamp = new Date(newDate).getTime() / 1000.0
                    //console.log(new_timestamp); return;



                var to_time = parseInt(86400) + parseInt(new_timestamp);

                conditons.venue_id = data.venue_id;
                conditons.createdAt = {
                    $lt: to_time,
                    $gte: new_timestamp,
                };
                // conditons.createdAt = data.timestamp;
                
                const results = await orders.findAll({
                    order: [
                        ['id', 'DESC']
                    ],
                    include: [{
                            model: vanue,
                            attributes: ['name']
                        },
                        {
                            model: vanue,
                            as: 'userDetail',
                            attributes: ['name']
                        },
                        {
                            model: Terminal,
                            attributes: ['name']
                        },
                    ],
                    where: conditons
                });
                //console.log(results); return;
                res.render('venue/orders_list', { response: results, _venue: ven, timestamp : data.timestamp, date: dateTime, msg: req.flash('msg'), title: 'venue' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (e) {
            throw e;
        }
    },
     view_order_detail: async(req, res) => {
        //console.log(req.query); return;
        try {
            if (req.session.auth && req.session.auth == true) {
                const results = await orderDetails.findAll({
                    include: [{
                            model: vanue,
                            attributes: [
                                'name', 'image','email','address'
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
                            model: Terminal,
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: pro,
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
                //************* real code for email template starts here ***********//
                /*   ejs.renderFile("/var/www/html/barmate/views/new_test.ejs", { response: results, date: dateTime }, function (err, data) {
                  if (err) {
                      console.log(err);
                  } else {
                      var mail = {
                          from: '"Barmate" testmail@zoho.com',
                          to: "sandeepcqlsys001@gmail.com",
                          subject: 'Order Detail',
                          html: data
                      };
                      helpers.send_mail(mail);
                  }
                  });   */
                //************* real code for email template ends here ***********//
                res.render('order/new_order_view', { response: results, date: dateTime, msg: req.flash('msg'), title: 'venue' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    }, 

    //  generate receipt function
    generate_receipt: async(order_id) => {
        try {
                const results = await orderDetails.findAll({
                    include: [{
                            model: vanue,
                            attributes: [
                                'name', 'image','email','address','phone','fax','abn'
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
                            model: Terminal,
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: pro,
                            attributes: [
                                'name', 'quantity', 'unit'
                            ]
                        },
                        {
                            model: orders,
                            attributes: [
                                'status', 'tbm_service', 'total', 'createdAt','receipt_no'
                            ]
                        },
                    ],
                    where: {
                        order_id: order_id
                    }
                });
                return results ;
                
        } catch (err) {
            throw err;
        }
    }  ,


    /**
     * Venue Integrations
     */


    venue_integrations: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                const venue = await vanue.find({
                    where: {
                        id: req.query.id
                    }
                });
                const venue_integration = await VenueIntegration.find({
                    where: {
                        venue_id: venue.id
                    }
                })
                // res.send(venue_integration)
                // res.json(find_user)
                res.render('venue/venue_integrations', { venue, venue_integration, title: 'venue' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (e) {
            res.send(e)
            throw err;
        }
    },

    /**
     * Venue Integrations Swift
     */

    venue_integrations_swift: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                const venue = await vanue.find({
                    where: {
                        id: req.query.id
                    }
                });
                const venue_integration = await VenueIntegration.find({
                    where: {
                        venue_id: venue.id
                    }
                })
                // res.json(find_user)
                res.render('venue/venue_integrations_swift', { venue, venue_integration, title: 'venue' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            res.send(e)
            throw err;
        }
    },
    venue_integrations_swift_connect: async(req, res) => {
        try {
            /**
             * TODO: save fields in json table
             *
             * Add to order
             */
                // Get Api Key
            let {data} = await axios.post('https://webstores.swiftpos.com.au:4443/SwiftApi/api/Authorisation', {
                    locationId: req.body.location_id,
                    userId: req.body.user_id,
                    password: req.body.password
                })
            try {
                // Create Member
                let {data: member} = await axios.post(URL + 'Member', {
                    Id: 567567567,
                    Type: 0,
                    FirstName: 'TheBarMate',
                    Surname: 'TheBarMate',
                    DateOfBirth: (new Date(1980, 12, 12)).toISOString(),
                    EmailAddress: 'support@thebarmate.com',
                    Classifications: [
                        {
                            "Id": 1,
                            "Type": 1,
                            "RenewalDate": (new Date(2030, 12, 12)).toISOString()
                        }
                    ]
                }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'ApiKey': apiKey,
                    }
                })
            } catch (e) {}
            // Save Integration
            await VenueIntegration.create({
                venue_id: req.body.id,
                site: 'swift',
                data: {
                    locationId: req.body.location_id,
                    userId: req.body.user_id,
                    password: req.body.password
                },
                completed: true
            })
            // res.send(data)
            res.redirect('back')
        } catch (e) {
            res.send(e)
            // req.flash('msg', "Incorrect details")
            // res.redirect('back');
        }
    },
    venue_integrations_swift_import: async(req, res) => {
        try {
            const venue = await vanue.find({
                where: {
                    id: req.body.id
                }
            });
            const venue_integration = await VenueIntegration.find({
                where: {
                    venue_id: venue.id
                }
            })
            // res.send(venue_integration.data)
            let apiKey = await SwiftManager.getApiKey(venue_integration)
            let products = await SwiftManager.getProducts(apiKey)
            for(let product of products) {
                let imageUri = 'https://admin.thebarmate.com/'
                let imagePath = 'images/'+UUID.v4()+'.png'
                let imageLink = null
                if(product.Image) {
                    try {
                        fs.writeFileSync("public/"+imagePath, product.Image, {encoding: 'base64'})
                        imageLink = imageUri + imagePath
                    } catch (e) {
                        res.send('error1')
                    }
                }
                await Product.create({
                    name: product.Description.Standard,
                    integration_id: product.Id,
                    price: product.Price,
                    image: imageLink,
                    venue_id: req.body.id,
                    main_category_id: 3 // Unknown
                })
            }
            res.redirect('back')
        } catch (e) {
            res.send(e)
            // req.flash('msg', "Incorrect details")
            // res.redirect('back');
        }
    },
    venue_integrations_swift_disconnect: async(req, res) => {
        try {
            await VenueIntegration.destroy({
                where: {
                    venue_id: req.body.id
                }
            })
            // res.send(data)
            res.redirect('back')
        } catch (e) {
            res.send(e)
            // req.flash('msg', "Incorrect details")
            // res.redirect('back');
        }
    },
    venue_integrations_swift_delete: async(req, res) => {
        try {
            await Product.destroy({
                where: {
                    venue_id: req.body.id,
                    integration_id: {
                        [Op.ne]: null
                    }
                }
            })
            res.redirect('back')
        } catch (e) {
            res.send(e)
            // req.flash('msg', "Incorrect details")
            // res.redirect('back');
        }
    },


    /**
     * Venue Integrations Kounta
     */
    venue_integrations_kounta: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                const venue = await vanue.find({
                    where: {
                        id: req.query.id
                    }
                });
                const venue_integration = await VenueIntegration.find({
                    where: {
                        venue_id: venue.id
                    }
                })
                // res.json(find_user)
                res.render('venue/venue_integrations_kounta', { venue, venue_integration, title: 'venue' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            res.send(e)
            throw err;
        }
    },
    venue_integrations_kounta_connect: async(req, res) => {
        try {
            let data = {
                client_id: req.body.client_id,
                client_secret: req.body.client_secret,
                state: req.body.id,
                redirect_uri: 'https://admin.thebarmate.com/venue_integrations_kounta_callback',
                response_type: 'code',
                scope: []
            }
            await KountaManager.createVenueIntegration(req.body.id, data)
            res.redirect('https://my.kounta.com/authorize?' + require('querystring').stringify(data));
        } catch (e) {
            // res.send('error')
            return res.status(500).json({ status: 500, message: 'There was a problem :' + e });
            next(e)
            throw e;
        }
    },
    venue_integrations_kounta_callback: async(req, res) => {
        const venue_integration = await VenueIntegration.find({
            where: {
                venue_id: req.query.state
            }
        })
        try {
            let {data} = await axios.post('https://api.kounta.com/v1/token', {
                code: req.query.code,
                client_id: venue_integration.data.client_id,
                client_secret: venue_integration.data.client_secret,
                redirect_uri: venue_integration.data.redirect_uri,
                grant_type: 'authorization_code'
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            })
            let savedData = {
                ...venue_integration.data,
                ...data
            };
            venue_integration.update({
                data: {
                    ...venue_integration.data,
                    ...data
                },
                completed: true
            })
            res.redirect('https://admin.thebarmate.com/venue_integrations_kounta?id=' + req.query.state)
        } catch (e) {
            res.send(e)
        }
    },
    venue_integrations_kounta_import: async(req, res) => {
        try {
            const venueIntegration = await KountaManager.getVenueIntegration(req.body.id)
            await KountaManager.refreshAccessToken(venueIntegration)
            const company = await KountaManager.getCompany(venueIntegration)
            const sites = await KountaManager.getSites(venueIntegration, company)
            const products = await KountaManager.getProducts(venueIntegration, company, sites[0])
            await KountaManager.saveProducts(venueIntegration, products)
            res.redirect('https://admin.thebarmate.com/venue_integrations_kounta?id=' + req.body.id)
        } catch (e) {
            res.send(e)
        }
    },
    venue_integrations_kounta_delete: async(req, res) => {
        try {
            const venueIntegration = await KountaManager.getVenueIntegration(req.body.id)
            await KountaManager.deleteProducts(venueIntegration)
            res.redirect('back')
        } catch (e) {
            res.send('error')
        }
    },
    venue_integrations_kounta_disconnect: async(req, res) => {
        try {
            const venueIntegration = await KountaManager.getVenueIntegration(req.body.id)
            await KountaManager.disconnect(venueIntegration)
            res.redirect('back')
        } catch (e) {
            res.send(e)
            // req.flash('msg', "Incorrect details")
            // res.redirect('back');
        }
    },

}