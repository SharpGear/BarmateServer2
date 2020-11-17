const model = require('../models');
// const db = page.orders;
const dateTime = require('node-datetime');
const users = model.users;
const userPayments = model.userPayments;
const Transactions = model.transactions;
const vanue = model.venues;

const helper = require('../helper/');
Transactions.belongsTo(vanue, { foreignKey: 'user_id' });
Transactions.belongsTo(vanue, { foreignKey: 'venue_id' , as : 'venueDetail'});
//Transactions.belongsTo(vanue, { foreignKey: 'user_id' });
//Transactions.belongsTo(vanue, { foreignKey: 'venue_id', as: 'venueDetail' });

module.exports = {
  userPayments_list: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const results = await Transactions.findAll({
          order: [['id', 'DESC']],
          include: [
            {
              model: vanue,
              attributes: [
                'name'
              ]
            },
            {
              model: vanue,
              as: 'venueDetail',
              attributes: [
                'name'
              ]
            },


          ],
        });
       // console.log(results); return;

        res.render('payments/list', { response: results, msg: req.flash('msg'), date : dateTime , title: 'payment' });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (err) {
      throw err;
    }
  },

  view_UserPayment: async (req, res) => {
    try {
      if (req.session.auth && req.session.auth == true) {
        if (req.query.id != '') {
          const results = await userPayments.findAll({
            where: { id: req.query.id },
            include: [
              {
                model: users,
                attributes: [
                  'name'
                ]
              },

            ],
          });
          res.render('payments/view', { response: results[0], title: 'payment' });
        }
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (err) {
      throw err;
    }
  },

  vanuePayments_list: async (req, res) => {
    try {
      if (req.session.auth && req.session.auth == true) {
       /*  const results = await venuePayments.findAll({
          order: [['id', 'DESC']],
          include: [
            {
              model: vanue,
              attributes: [
                'name'
              ]
            },

          ],
        }); */
         const results = await Transactions.findAll({
          order: [['id', 'DESC']],
          include: [
            {
              model: vanue,
              attributes: [
                'name'
              ]
            },
            {
              model: vanue,
              as: 'venueDetail',
              attributes: [
                'name'
              ]
            },


          ],
          where :{
            payout : 1
          }
        });

        res.render('vanue_payments/list', { response: results, date : dateTime, msg: req.flash('msg'), title: 'payment' });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (err) {
      throw err;
    }
  },
 

}