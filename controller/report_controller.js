const db = require('../models');
const helper = require('../helper/index');
const report=db.report;
const venues=db.venues;
const mainCategory = db.mainCategory;
const fileupload = helper.file_upload;
const constant = require('../config/constant');
report.belongsTo(venues, { foreignKey: 'report_by' });
module.exports = {
    reports:async function(req,res){
        try{
            if (req.session.auth && req.session.auth == true) {
           /*  console.log("hello innnnnnnnnnnn");return; */
            get_reports= await report.findAll({
                  include:[{
                  attributes:['id','name','email','image'],
                  model:venues,
                  required:true

                }],
                order:[
                    ['id','desc']
                ]
            });
            if (get_reports) {
                get_reports = get_reports.map(value => {
                    return value.toJSON();
                });
            }
            
     console.log(get_reports,"get_reports")
     res.render('reports/list', { response: get_reports, msg: req.flash('msg'), title: "report" });
        }else{
            req.flash('msg', "please login first")
            res.redirect('/');
        }
        }catch(error){
            throw error
        }
    },
    view_report:async function(req,res){
        try{
            if (req.session.auth && req.session.auth == true) {
            get_reports= await report.findOne({

                 where:{
                     id:req.query.id
                 },
                include:[{
                attributes:['id','name','email','image'],
                model:venues,
                required:false

              }],
              order:[
                  ['id','desc']
              ]
          });
         
          res.render('reports/view', { response: get_reports, msg: req.flash('msg'), title: "report" });
           /* console.log(get_reports,"get_reports");return */

        }else{
            req.flash('msg', "please login first")
            res.redirect('/');
        }
        }catch(error){
            throw error
        }
    }

}