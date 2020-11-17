const db = require('../models');
const Content = db.contents;
let Sequelize = require('sequelize');
const constant = require('../config/constant');

module.exports = {

  index: async function (req, res) {

    try {
      if (req.session.auth && req.session.auth == true) {
        let pages = await Content.findAll({
          attributes:['id','title','description']
        });
      
        res.render('pages', { response: pages, msg: req.flash('msg'), title: 'pages' });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {

      throw e;
    }
  },
  edit: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const page = await Content.findOne({
          where: {
            id: req.query.id,
          }
        });
        //console.log(users); return false;
        res.render('pages/edit', { response: page, title: 'pages' })
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  update: async function (req, res) {
    
    try {
      if (req.session.auth && req.session.auth == true) {
        await Content.update(
        {
          title:req.body.title,
          description:req.body.content
        },
        { where: { id: req.body.id } }

        );
        //console.log(save);return false;
        req.flash('msg', "Page updated successfully")
        res.redirect('/pages');
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
}
