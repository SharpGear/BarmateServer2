const db = require('../models');
// const db = page.orders;
const helpers = require('../helper/index');
const password = helpers.crypt;

const vanue = db.venues;
const terminals = db.terminals;
const terminals_user = db.venues;
terminals.belongsTo(vanue, { foreignKey: 'venue_id' });
terminals.hasOne(terminals_user, { as: 'terminalDetail', foreignKey: 'terminal_id' });

const helper = require('../helper/')
module.exports = {
    terminals_list: async function(req, res) {
        try {
            if (req.session.auth && req.session.auth == true) {
                const results = await terminals.findAll({
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
                            model: terminals_user,
                            as: 'terminalDetail',
                            attributes: [
                                'email'
                            ]
                        }
                    ]
                });
                // console.log(results);
                //return;
                res.render('terminals/list', { response: results, msg: req.flash('msg'), title: 'terminal' })
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (e) {
            throw e;
        }
    },

    edit_terminal: async function(req, res) {
        try {
            if (req.session.auth && req.session.auth == true) {
                if (req.query.id != '') {
                    const results = await terminals.findOne({
                        where: { id: req.query.id },

                    });
                    const venues = await vanue.findAll({
                        attributes: ['id', 'name'],
                        where: {
                            user_type: 0
                        }
                    });
                    const _term_email = await terminals_user.findOne({
                        attributes: ['id', 'name', 'email', 'terminal_id', 'user_type'],
                        where: {
                            terminal_id: req.query.id,
                            user_type: 2
                        }
                    });

                    res.render('terminals/edit', { response: venues, result: results, term_email: _term_email, msg: req.flash('msg'), title: 'terminal' });
                }
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },

    update_terminals: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                const data = req.body;
                const crypt = password(data.password);
                // console.log(req.body);
                // return;
                var user_data = await terminals.findOne({
                    where: {
                        id: data.id,
                        venue_id: data.venue,
                    }
                });
                const terminal_data_check = await vanue.findOne({
                    attributes: ['id', 'terminal_id'],
                    where: {
                        terminal_id: data.id,
                        //user_type: 2
                    }
                });
                if (terminal_data_check) {
                    const save = await terminals.update({
                        name: data.name,
                    }, {
                        where: {
                            id: data.id,
                            venue_id: data.venue,

                        }
                    });
                    const save2 = await vanue.update({
                        name: data.name,
                        email: data.email,
                        password: crypt,

                    }, {
                        where: {
                            terminal_id: data.id,

                        }
                    });

                    // return responseHelper.post(res, requestdata);
                } else {

                    const save = await terminals.update({
                        name: data.name,
                    }, {
                        where: {
                            id: data.id,
                            venue_id: data.venue,

                        }
                    });
                    const img = await vanue.findOne({
                        attributes: ['image'],
                        where: {
                            id: data.venue
                        }
                    });
                    const ven = await vanue.create({
                            name: data.name,
                            email: data.email,
                            password: crypt,
                            image: img.dataValues.image,
                            terminal_id: data.id,
                            is_verified: 1,
                            user_type: 2,
                        })
                        // return responseHelper.post(res, requestdata);
                }


                req.flash('msg', "terminal updated successfully")

                res.redirect('/terminal');
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

    add_terminal: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {
                const venues = await vanue.findAll({
                    attributes: ['id', 'name'],
                    where: {
                        user_type: 0
                    }
                });
                /*let response = {
                    response: '',
                    venues: venues
                }*/
                res.render('terminals/add', { response: venues, msg: req.flash('msg'), title: 'terminal' });
            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },


    save_terminals: async(req, res) => {
        try {
            if (req.session.auth && req.session.auth == true) {

                // console.log(password);
                // return;
                const crypt = password(req.body.password);
                const save = await terminals.create({
                    venue_id: req.body.venue,
                    name: req.body.name,
                });
                if (save) {
                    const img = await vanue.findOne({
                        attributes: ['name', 'image'],
                        where: {
                            id: req.body.venue,
                        }
                    });
                    const ven = await vanue.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: crypt,
                        image: img.dataValues.image,
                        terminal_id: save.dataValues.id,
                        is_verified: 1,
                        user_type: 2,
                    });
                    req.flash('msg', "terminal added successfully")
                    res.redirect('/terminal');
                } else {
                    req.flash('msg', "error in save terminal")
                    res.redirect('/terminal');
                }

            } else {
                req.flash('msg', "please login first")
                res.redirect('/');
            }
        } catch (err) {
            throw err;
        }
    },


    view_terminal: async(req, res) => {
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