const db = require('../models');
// const db = page.orders;
const Brand = db.brands;


const helper = require('../helper/')
module.exports = {
    brand_list: async function(req, res) {
        try {
            if (req.session.auth && req.session.auth == true) {
                const results = await Brand.findAll({
                    order: [
                        ['id', 'DESC']
                    ],
                });
                // console.log(results);
                //return;
                res.render('brands/list', { response: results, msg: req.flash('msg'), title: 'brand' })
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (e) {
            throw e;
        }
    },

    edit_brand: async function(req, res) {
        try {
            if (req.session.auth && req.session.auth == true) {
                if (req.query.id != '') {
                    const results = await Brand.findOne({
                        where: { id: req.query.id },

                    });

                    res.render('brands/edit', { result: results, msg: req.flash('msg'), title: 'brand' });
                }
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },

    update_brand: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                const data = req.body;
              
                    const save2 = await Brand.update({
                        name: data.name,
                
                    }, {
                        where: {
                            id: data.id,

                        }
                    });

                req.flash('msg', "Brand updated successfully")

                res.redirect('/brands');
                /* } else {
                    req.flash('msg', "error in update terminal")
                    res.redirect('/terminal');
				} */


            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },

    add_brand: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
            
                res.render('brands/add', { msg: req.flash('msg'), title: 'brand' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },


    save_brand: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {

                check_brand_name= await Brand.findAll({
                    where:{
                        name:req.body.name
                    }
                });
                /*  console.log(check_brand_name,"check_brand_name"); */

                if(check_brand_name.length>0){
                    req.flash('msg', "Brand Name Already Exist")
                    res.redirect('/add_brand');
                    return;
                }

                const save = await Brand.create({
                    name: req.body.name,
                });
                if (save) {
                   
                    req.flash('msg', "Brand added successfully")
                    res.redirect('/brands');
                } else {
                    req.flash('msg', "error in adding Brand")
                    res.redirect('/brands');
                }

            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },


    view_brand: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                if (req.query.id != '') {
                    const results = await terminals.findAll({
                        where: { id: req.query.id },
                        include: [{
                                model: vanue,
                                attributes: [
                                    'name'
                                ]
                            },
                            {
                                model: terminals_user,
                                as: 'terminalDetail',
                                attributes: [
                                    'email'
                                ]
                            },
                        ]
                    });

                    res.render('terminals/view', { response: results[0], msg: req.flash('msg'), title: 'terminal' });
                }
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    }

}