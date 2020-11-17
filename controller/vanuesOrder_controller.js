const db = require('../models');
// const db = page.orders;
const vanue = db.venues;
const helper = require('../helper/')
module.exports = {
	vanuesOrder_list: async function (req, res) {
		try {
			if (req.session.auth && req.session.auth == true) {
				const results = await vanue.findAll();

				res.render('venue/list', { response: results, title: 'venue' });
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw err;
		}
	},

	edit_vanue: async function (req, res) {
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
	vanueOrders: async (req, res) => {
		try {
			const results = await vanue.findAll();
			console.log(results); return false;
		} catch (err) {
			throw err;
		}
	}

}