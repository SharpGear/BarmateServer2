const sequelize = require('sequelize');
const model = require('../models');
const db = model.subcategories;
const cate = model.categories;
const vanue = model.venues;
const mainCategory = model.mainCategory;
const helper = require('../helper');
const imageupload = helper.file_upload;
db.belongsTo(cate, { foreignKey: 'category_id' });
db.belongsTo(mainCategory, { foreignKey: 'main_category_id' });

db.belongsTo(vanue, { foreignKey: 'venue_id' });
const constant = require('../config/constant');


module.exports = {
	subcategory_list: async function (req, res) {
		try {
			// const results = await db.findAll();
			// res.render('subcategory/list', { response: results });
			if (req.session.auth && req.session.auth == true) {
				const results = await db.findAll({
					/* attribute: [
						'name', 'id', 'image', 'status'
					], */
					order: [['id', 'DESC']],
					include: [
						{
							model: cate,
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
					],
					where : {
						is_deleted : 0
					}
				});
//console.log(results[0].dataValues.category.dataValues.name); return;
				res.render('subcategory/list', { response: results, msg: req.flash('msg'), title: 'subcategory' });
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw e;
		}
	},

	subcategory: async function (req, res) {
		try {
			if (req.session.auth && req.session.auth == true) {
				
					const data = await cate.findAll();
					let datas = await mainCategory.findAll();
					res.render('subcategory/addsubcate', { response: data, main_cat_data: datas,  title: "subcategory" });
				
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw e;

		}
	},

	addsubcate: async function (req, res) {
		//console.log(req.files); return;
		try {
			if (req.session.auth && req.session.auth == true) {
				//console.log(req.body);
			//	const data = constant.image_url + imageupload(req.files.image)
				const results = await db.create({
					venueId: 0,
					categoryId: req.body.category,
					name: req.body.name,
					image: '',
					main_category_id: req.body.main_category,
				})
				req.flash('msg', "subcategory added successfully")
				res.redirect('/subcate_list');
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw e;
		}
	},
	edit_subcate: async function (req, res) {
//console.log(req.query);return;
		try {
			if (req.session.auth && req.session.auth == true) {
				const results = await db.findAll( {
					where: {
						id: req.query.id,
					}
				})
				if (results != '') {
					
						const drop = await cate.findAll();
						let datas = await mainCategory.findAll();
						//console.log(main_cat)
						res.render('subcategory/editsubcate', { response: results, main_cat: datas,  cat: drop, title: "subcategory" })

					
				} else {
					res.render('subcategory/editsubcate', { response: '', main_cat: '', cat: '', title: "subcategory" })
				}
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw e;
		}
	},
	update_subcate: async function (req, res) {
		// console.log(req.body.id);return false;
		const data = req.body;
		const files = req.files;
		data.files = files;
		//console.log(data);return;
		try {
			if (req.session.auth && req.session.auth == true) {
			/* 	const user = await db.findOne({
					where: {
						id: req.body.id
					}
				});
				let old_image = user.dataValues.image;
				let image_url = ''; */
				//console.log(data.files.image);return false;
			/* 	if (data.files.image != '' && data.files.image) {

					let image = data.files.image;
					image_url = data.files.image.name;
					data.files.image.mv(process.cwd() + '/public/images/' + data.files.image.name, function (err) {
						if (err)
							return res.status(500).send(err);
						//res.send('File uploaded!');
					});
					old_image = constant.image_url + image_url;
				} */
				console.log(req.body);
				const save = await db.update(
					{
						categoryId: req.body.category_id,
						name: req.body.name,
						//image: old_image,
						main_category_id: req.body.main_category,
					},
					{ where: { id: req.body.id } }

				);
				//console.log(save);return false;
				req.flash('msg', "subcategory updated successfully")
				res.redirect('/subcate_list');
			} else {
				req.flash('msg', "please login first")
				res.redirect('/');
			}
		} catch (e) {
			throw e;
		}
	},

/* 	getsubCategory: async (req, res) => {
		try {
			const results = await db.findAll({
				where: { category_id: req.body.id },
				attributes: [
					'id', 'name'
				]
			});

			return res.json(results);
		} catch (err) {
			throw err;
		}
	},

	get_category: async (req, res) => {
		try {
			if (req.body.id != '') {
				const results = await cate.findAll({
					where: { main_category_id: req.body.id },
					order: [['id', 'DESC']],
					attributes: [
						'id', 'name'
					]
				});
				return res.json(results);
			} else {
				return res.json('0');
			}
		} catch (err) {
			throw err;
		}
	}, */
	check_sub_cat_name: async function (req, res) {
    try {
			let new_name = req.body.name.toLowerCase();
      const name = await db.findOne({
        attributes :['name'],
        where: {
           name: new_name,
					category_id: req.body.category_id,
					is_deleted : 0
        }
      });
      //console.log(emails);return false;
      if (name) {
        res.json('1');
      } else {
        res.json('0');
      }


    } catch (e) {
      console.log(e);
    }
  },
}