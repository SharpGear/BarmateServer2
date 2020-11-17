const db = require('../models');
const helper = require('../helper');
const Admin = db.admins;
const users = db.venues; // user_type = 1
const venues = db.venues;  // user_type = 0
const userPayments = db.userPayments;
const orders = db.orders;
const password = helper.crypt;
const fileupload = helper.file_upload;
let Sequelize = require('sequelize');
let Op = Sequelize.Op;
const moment = require('moment');
const Transactions = db.transactions;
 orders.belongsTo(venues, { foreignKey: 'user_id' });
orders.belongsTo(venues, { foreignKey: 'venue_id', as : 'venueDetail' }); 

module.exports = {
	login: function (req, res) {
		try {

			res.render('admin/login', { msg: req.flash('msg') });
		} catch (e) {
			throw e;
		}
	},
	stripe_connect: function (req, res) {
		try {

			res.render('admin/stripe_connect', { msg: req.flash('msg') });
		} catch (e) {
			throw e;
		}
	},
	dashboard: async function (req, res) {
		if (req.session.auth && req.session.auth == true) {
			try {
				// console.log(Op); return false;
				users.count({
					where: {
						[Op.and]: [
							Sequelize.literal(`created_at >= CURDATE() - INTERVAL 1 YEAR`)],
					},
					group: Sequelize.literal(`YEAR(created_at),Month(created_at)`),
					attributes: [[
						Sequelize.literal('Month(created_at)'), 'Months']
					]
				}).then(async users_count_year => {
					// console.log(users_count_year);
					// return false;
					let productArray = [];
					for (let i = 1; i <= 12; i++) {
						for (let j in users_count_year) {
							if (i == users_count_year[j].Months) {
								productArray[i] = users_count_year[j].count;

							}
							else {
								productArray[i] = 0;
							}
						}

					}
					productArray.splice(0, 1);
					/* orders.belongsTo(users, { foreignKey: 'user_id' });
					orders.belongsTo(venues, { foreignKey: 'venue_id' }); */
         
					venues.count({
						where : {
							user_type : 1
						}
					}).then(async users_count => {
						venues.count({
							where : {
								user_type : 0
							}
						}).then(async venues_count => {
							Transactions.count().then(async userPayments_count => {
								orders.count().then(async orders_count => {
									let latest_user_data = await venues.findAll({ where : { user_type : 1 }, order: [['id', 'DESC']], limit: 5 });
									let latest_order_data =  await orders.findAll({
										order: [['id', 'DESC']],
										limit: 5,
										include: [
											{
												model: venues,
												as:'userDetails',
												attributes: [
													'name'
												]
											},
											{
												model: venues,
												as: 'venueDetail',
												attributes: [
													'name'
												]
											}
										],

									});

									let orders_earning;
									if (req.query.start_date && req.query.end_date) {
										//console.log(req.query.start_date); return;
									/* 	moment(Date.parse('Tue Feb 23 2016 20:11:42 GMT+0200 (EET)')).format('YYYY-MM-DD HH:mm:ss');
 */
									 /* 	let start_date = moment(req.query.start_date, 'MM/DD/YYYY').format('YYYY-MM-DD') + " 00:00:00"; 
										
										let end_date = moment(req.query.end_date, 'MM/DD/YYYY').format('YYYY-MM-DD') + " 00:00:00"; */
									//	var unixTimeZero = Date.parse(req.query.start_date) / 1000 + 86400;
									// var s = new date(req.query.start_date); 
									// console.log(s);
										let start_date = Date.parse(req.query.start_date ) / 1000;
										let end_date = Date.parse(req.query.end_date )  / 1000 + 86400  ;

										// console.log(start_date); 
										// console.log(end_date); return;
										try {
											orders_earning = await orders.findAll({
												// where: Sequelize.where(Sequelize.fn('date', Sequelize.col('createdAt')), 'between', req.query.start_date)
												attributes: ['id', 'createdAt', [Sequelize.fn('sum', Sequelize.col('total')), 'createdAtcount']],
												where: {
													createdAt: {
														$between: [start_date, end_date]
													}
												},
												group: Sequelize.literal(`id`)
											//	group: Sequelize.literal(`YEAR(createdAt),Month(createdAt),Date(createdAt)`)
											});
										} catch (e) {
											console.log('error ===>', e);
										}
									} else {
										orders_earning = await orders.findAll({
											attributes: ['id', 'createdAt', [Sequelize.fn('sum', Sequelize.col('total')), 'createdAtcount']],
											group: Sequelize.literal(`id`)
											// order: [['createdAt', 'DESC']],
										});
									}
							
									let admin_earnings = [];
									for (let index = 0; index < orders_earning.length; index++) 
									{
										const element = orders_earning[index];
										var t =element.dataValues.createdAt * 1000;
										var amount = element.dataValues.createdAtcount * 20/100 ;
											let dd =  new Date(t);
											let mm =  dd.getMonth() + 1;
											let yy =  dd.getFullYear();
											let _dd =  dd.getDate();
											mm =  (mm < 10) ? '0'+mm : mm;
										 //console.log(dd.getMonth(),'sdsd');
										 let _t =  mm+'/'+_dd+'/'+yy;
										 admin_earnings.push({
										
											date: _t,
											value: amount
										});
										
										
									}
								
									admin_earnings = JSON.stringify(admin_earnings);
									//console.log(admin_earnings,'jjjjl');

									let results = {
										users: users_count,
										venues: venues_count,
										userPayments: userPayments_count,
										users_count_year: productArray,
										orders_count: orders_count,
										all_user_data: latest_user_data,
										latest_order_data: latest_order_data,
										orders_earning: orders_earning,
										start_date: (req.query.start_date) ? req.query.start_date : '',
										end_date: (req.query.end_date) ? req.query.end_date : '',
										admin_earnings: admin_earnings
									}
									// console.log(results.admin_earnings);
									res.render('partials/dashboard', { response: results, title: "dashboard" });


								});
							});
						});
					})
				});
				/* users.count().then(users_count => {
					venues.count().then(venues_count => {
						userPayments.count().then(userPayments_count => {
							let results = {
								users: users_count,
								venues: venues_count,
								userPayments: userPayments_count,
							}
							res.render('partials/dashboard', { response: results, title: "dashboard" });
						});
					});
				}) */
			} catch (e) {
				throw e;
			}
		} else {
			req.flash('msg', "please login first")
			res.redirect('/');
		}
	},
	get_user_venue_bars_data : async function(req,res) {
		let data= {};
		data.users = [];
		data.venues = [];
		
    try {

			let start_date = moment(req.body.start_date, 'MM/DD/YYYY').format('YYYY-MM-DD') + " 00:00:00";
			let end_date = moment(req.body.end_date, 'MM/DD/YYYY').format('YYYY-MM-DD') + " 00:00:00";

      const total_users = await venues.findAll({
				where: {
					createdAt: {
						$between: [start_date, end_date]
					},
					user_type : 1,
				},
        attributes: [
					[Sequelize.fn('date', Sequelize.col('created_at')),'date'],
					[Sequelize.fn('count', Sequelize.col('id')), 'total']],
        group : ['date']
			});
			// console.log(total_users);

			const total_venues_data = await venues.findAll({
				where: {
					createdAt: {
						$between: [start_date, end_date]
					},
					user_type : 0,
				},
				attributes: [
					[Sequelize.fn('date', Sequelize.col('created_at')),'date'],
					[Sequelize.fn('count', Sequelize.col('id')), 'total']
				],
				group: ['date']
			});

			if (total_venues_data) {
				for (let i = 0; i < total_venues_data.length; i++) {
					data.venues.push(total_venues_data[i].dataValues);
				}
			}

      if (total_users) {
        for(let i = 0; i< total_users.length;i++) {
             data.users.push(total_users[i].dataValues);             
				}
			} 
			// console.log(data);
			
			if (total_venues_data || total_users) {
				res.send(data);
			}

    } catch (e) {
      console.log(e);
    }
	},
	users_chart_dashboard : async function(req,res) {
    let data= [];
    try {


      const total_users = await venues.findAll({
				attributes: [[Sequelize.fn('date', Sequelize.col('created_at')),'date'],[Sequelize.fn('count', Sequelize.col('id')), 'total']],
				where : {
					user_type : 1,
				},
        group : ['date']
			});

      if (total_users) {
        for(let i = 0; i< total_users.length;i++) {
             data.push(total_users[i].dataValues);
             
				}
				// console.log(data);
       res.send(data)
      } else {
      
      }

    } catch (e) {
      console.log(e);
    }
	},
	venues_chart_dashboard : async function(req, res) {
		let data = [];
		try {
			const total_venues_data = await venues.findAll({
				attributes: [
					[Sequelize.fn('date', Sequelize.col('created_at')),'date'],
					[Sequelize.fn('count', Sequelize.col('id')), 'total']
				],
				where : {
					user_type : 0,
				},
				group: ['date']
			});

			if (total_venues_data) {
				for (let i = 0; i < total_venues_data.length; i++) {
					data.push(total_venues_data[i].dataValues);
				}

				res.send(data);
			}
		} catch (e) {
			console.log(e);
		}
	},
	login_succsess: async function (req, res) {
		const data = password(req.body.password);
		const email = req.body.email;
		//console.log(req.body.password); return;
		try {
			const results = await Admin.findOne({
				where: {
					email: email,
					password: data
				}
			});
			if (results) {
				//console.log(results);
				res.session = res.session;
				res.session = results.dataValues;
				// res.render('partials/dashboard');
				req.session.auth = true;
				res.redirect('/dashboard');

			}
			else {
				req.flash('msg', "invalid details")
				res.redirect('/')
			}

		} catch (e) {
			throw e;
		}
	},
	logout: function (req, res) {

		if (req.session && req.session != '') {
			req.session.auth = false;;
			req.flash('msg', "logout Successfully");
			res.redirect('/');
		}

	},

	// get admin profile
	admin_list: async function (req, res) {
		try {
			if (req.session.auth && req.session.auth == true) {
				const results = await Admin.findAll()
				res.render('admin/list', { response: results, msg: req.flash('msg'), title: 'dashboard' })
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw e;
		}
	},

	edit_admin: async function (req, res) {
		try {
			if (req.session.auth && req.session.auth == true) {
				const id = req.query.id;
				const results = await Admin.findOne({
					 where: { 
						 id: id 
					} 
					});
				res.render('admin/edit_content', { response : results ,title: "dashboard" });
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw e;
		}
	},

	update_admin: async function (req, res) {
		const new_password = password(req.body.password);
	//	console.log(req.body.password); return;
		try {
			if (req.session.auth && req.session.auth == true) {
				const data = req.body;
				const update = await Admin.update({
					 email: data.email,
					 password : new_password
				}, {
					where : {
						id : data.id
					}
				});
				req.flash('msg', "credentials updated successfully");
				res.redirect('/my_profile');
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw e;
		}
	},

	admins: async (req, res) => {
		try {
			res.render('admin/admin', { title: "admin" });
		} catch (err) {
			throw err;
		}
	}
}


