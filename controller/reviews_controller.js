const db = require('../models');
const helper = require('../helper/index');
const review=db.review;
const venues=db.venues;
const mainCategory = db.mainCategory;
const fileupload = helper.file_upload;
const constant = require('../config/constant');
review.belongsTo(venues, { foreignKey: 'review_by' });
module.exports = {
 
    Reviews:async function(req,res){
        try{
            if (req.session.auth && req.session.auth == true) {
            get_review= await review.findAll({
                include:[{
                attributes:['id','name','email','image'],
                model:venues,
                required:true

              }],
              order:[
                  ['id','desc']
              ]
          });
          if (get_review) {
            get_review = get_review.map(value => {
                  return value.toJSON();
              });
          }
          
  /*  console.log(get_review,"get_review") */
   res.render('reviews/list', { response: get_review, msg: req.flash('msg'), title: "Reviews" });
        }else{
            req.flash('msg', "please login first")
            res.redirect('/');
        }
        }catch(error){
            throw error
        }
    },
    view_review:async function(req,res){

        
        try{
            if (req.session.auth && req.session.auth == true) {
            get_review= await review.findOne({

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
        
         res.render('reviews/view', { response: get_review, msg: req.flash('msg'), title: "Reviews" });

        }else{
            req.flash('msg', "please login first")
            res.redirect('/');
        }
        }catch(error){
            throw error
        }
    }

    
}