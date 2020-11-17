const model = require('../models')
const helper = require('../helper/');
const dateTime = require('node-datetime');
const fileupload = helper.file_upload;
const constant = require('../config/constant');
const Ad = model.advertisements; // advertisement model 
const Venues = model.venues; // user_type = 0 : venue
const Terminals = model.terminals; 
const TerminalAds = model.terminal_advertisements; 
Ad.belongsTo(Venues , { foreignKey : 'venue_id'});
Ad.hasMany(TerminalAds , { foreignKey : 'ad_id'});

module.exports = {
  ad_list: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const ads = await Ad.findAll({
          attributes : ['id','title','gender','min_age','max_age','venue_id','media','description','createdAt'],
          include: [{
           model : Venues ,
           attributes : ['id','name','image'],
          },
         ],
         order: [['id', 'DESC']],
        });
         if(ads) {
          await Promise.all(ads.map(async c => {
          var gettrmnl_ids = await TerminalAds.findAll({
            attributes : ['id','terminal_id'],
            where : {
              ad_id : c.id,
            }
          });
          await Promise.all(gettrmnl_ids.map(async t => {           
             var get_name = await Terminals.findAll({
              attributes : ['id','name'],
              where : {
                id : t.terminal_id
              }
            });
            //console.log(get_name); return;
            t.dataValues.TerminalName =get_name ;
          }));
          c.dataValues.trmnl = gettrmnl_ids
        })); 
        } 
          // ads[0].dataValues.trmnl[1].dataValues.TerminalName[0].dataValues.name
        res.render('ads/list', { response: ads,  msg: req.flash('msg'), date : dateTime, title: 'advertisement' });
       } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      } 
    } catch (e) {
      throw e;
    }
  },
  get_ad_page: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const results = await Venues.findAll({
          attributes : ['id','name'],
          where : {
            user_type : 0,
          }
        });
        //console.log(results); return;
          res.render('ads/add_ads', { response: results, title: "advertisement" });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },

  save_ad: async function (req, res) {
   try {      
      if (req.session.auth && req.session.auth == true) {
        //console.log(req.body.terminal_id); return;
        const data = constant.image_url + fileupload(req.files.image);
        const save = await Ad.create({
          title: req.body.title,
          venue_id: req.body.venue_id,
          gender: req.body.gender,
          min_age: req.body.min_age,
          max_age: req.body.max_age,
          terminal_id: req.body.terminal_id,
          description: req.body.description,
          media: data,
          link: req.body.link
        }); 
         if (save) {
          const data = req.body.terminal_id;
          if (data ) {
            if ( Array.isArray(data) === true ) {
              await Promise.all(data.map( async c => {
                 await TerminalAds.create({
                ad_id : save.dataValues.id,
                venue_id : save.dataValues.venue_id,
                terminal_id : c
                });
                }));
          } else {
            await TerminalAds.create({
               ad_id : save.dataValues.id,
                venue_id : save.dataValues.venue_id,
                terminal_id : data
            });
          }
        }
      } 
        req.flash('msg', "ad added successfully")
        res.redirect('/advertisement');
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },

  edit_add: async function (req, res) {
    try {
      if (req.session.auth && req.session.auth == true) {
        const ad = await Ad.findOne({
          where: {
            id: req.query.id,
          },
          include:[{
            model:TerminalAds,
          }]
          
        });
        // console.log('=====================',ad.terminal_advertisements);
        // return false;
        // console.log("================",ids);
        // return false;
        if(ad){
          const ids = await ad.terminal_advertisements.map((adv)=>{
            return adv.terminal_id;
          })
          ad.terminal_ad_ids = ids;
          const terminals = await Terminals.findAll({
            where:{
              venue_id:ad.venue_id
            },
          });
          ad.terminals = terminals;
        }
       
        const venue = await Venues.findAll({
          attributes : ['id','name'],
          where : 
          {
            user_type : 0 
          }
        });
            res.render('ads/edit_ads',{response: ad, venue : venue, title: "advertisement" });
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  update_ad: async function (req, res) {
    //console.log(req.files); return;
    const data = req.body;
    const files = req.files;
    data.files = files;
    //console.log(data.files);return;
    try {
      if (req.session.auth && req.session.auth == true) {
        const user = await Ad.findOne({
          attributes : ['venue_id','media'],
          where: {
            id: data.id
          }
        });
        let old_image = user.dataValues.media;
        let image_url = '';
        //console.log(data.files.image);return false;
        if (data.files.image != '' && data.files.image) {

          //let image = data.files.image;
          image_url = data.files.image.name;
          data.files.image.mv(process.cwd() + '/public/images/' + data.files.image.name, function (err) {
            if (err)
              return res.status(500).send(err);
            //res.send('File uploaded!');
          });
          old_image = constant.image_url + image_url;
        }
        
        const results = await Ad.update({
          title: data.title,
          venue_id: data.venue_id,
          gender: req.body.gender,
          min_age: req.body.min_age,
          max_age: req.body.max_age,
          terminal_id: data.terminal_id,
          description: data.description,
          media: old_image,
          link: req.body.link
        }, 
          {
          where: { id: data.id }
        });
        if(data.venue_id != user.dataValues.venue_id) {
          await TerminalAds.destroy({
            where : {
            ad_id : data.id,
            }
            });
        }
        const terminal = data.terminal_id;
        if (terminal ) {
          await TerminalAds.destroy({
            where : {
            ad_id : data.id,
            }
            });
          if ( Array.isArray(terminal) === true ) {
            await Promise.all(terminal.map( async c => {
               await TerminalAds.create({
              ad_id : data.id,
              venue_id : data.venue_id,
              terminal_id : c
              });
              }));
        } else {
          await TerminalAds.create({
             ad_id : data.id,
              venue_id :  data.venue_id,
              terminal_id : terminal
          });
        }
      }

        req.flash('msg', "ad updated successfully")
        res.redirect('/advertisement');
      } else {
        req.flash('msg', "please login first")
        res.redirect('/');
      }
    } catch (e) {
      throw e;
    }
  },
  get_terminals: async (req, res) => {
    try {
      //console.log(req.body);return;
      const results = await Terminals.findAll({
        attributes: [
          'id', 'name'
        ],
        where: { venue_id: req.body.id ,},
      });
     // console.log(results); return;
      return res.json(results);
    } catch (err) {
      throw err;
    }
  },

 

}