const Database = require('../models');
const db = require('../models');
const Users = db.users;

const contant = require('../config/constant.js');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
async = require("async");
// var Validate = require('./validateInput.js');
var jwt = require('jsonwebtoken');
const jwtToken = 'secret';

var connect = '';
const nodemailer = require('nodemailer');
var FCM = require('fcm-node');
module.exports = class Helper  {
	constructor() {
		// super();
		this.db =  Database;
		connect = this.db;
		this.data = false;
		// const Users = Database.users;


	}
	calculateAge (y, m, d) {
        var _birth = parseInt("" + y + this.affixZero(m) + this.affixZero(d));
        var  today = new Date();
        var _today = parseInt("" + today.getFullYear() + this.affixZero(today.getMonth() + 1) + this.affixZero(today.getDate()));
        return parseInt((_today - _birth) / 10000);
    }
    calculateAge2 (y, m, d) {
        var _birth = parseInt("" + y + m + d);
        var  today = new Date();
        var _today = parseInt("" + today.getFullYear() + this.affixZero(today.getMonth() + 1) + this.affixZero(today.getDate()));
        return parseInt((_today - _birth) / 10000);
    }
	affixZero (int) {
        if (int < 10) int = "0" + int;
        return "" + int;
    }
	crypt(password) {
		const hash = crypto.createHmac('md5', password)
			.update('')
			.digest('hex');
		return hash;
	}

	image_Upload(image) {
		if (image) {

			var extension = path.extname(image.file.name);
			var filename = uuid() + extension;
			var sampleFile = image.file;


			sampleFile.mv(process.cwd() + '/public/images/users/' + filename, (err) => {
				if (err) throw err;


			});

			return filename;
		}
	}

	image_Uploads(image, already_files) { //file upload
		try {
			if (image) {
				var oldPath = image.image.path;
				var extension = path.extname(image.image.originalFilename);
				var filename = uuid() + extension;
				var newPath = process.cwd() + '/public/images/' + filename;
				fs.rename(oldPath, newPath, function (err) {

					if (err) throw err;
					if (already_files != '') {
						console.log(already_files);
						fs.unlink(process.cwd() + '/public/images/' + already_files);
					}
				});
				return filename;
			}
		} catch (err) {
			throw err;
		}
	}


	create_auth() {
		try {
			let current_date = (new Date()).valueOf().toString();
			let random = Math.random().toString();
			return crypto.createHash('sha1').update(current_date + random).digest('hex');
		} catch (err) {
			throw err;
		}
	}

	async check_auths(data, callback) {
		try {
			let rows = '';
			const [row, field] = await connect.db_connect.execute('SELECT * FROM `users` WHERE `is_deleted` = ? and authorization_key=? and security_key=?', ['0', data.auth_key, data.security_key]);
			if (row) {
				rows = row;
			}
			callback(rows);
		} catch (err) {
			throw err;
		}
	}

	async timestamp_to_date(date, res){
		var event = new Date(date * 1000);
		  var date = event.getDate();
          var month = event.getMonth(); 
          var year = event.getFullYear();
          var monthDateYear  = (month+1) + "-" + date + "-" + year ;
	   	  return	monthDateYear;
	}

	async vaildObject(required, non_required, res) {
		let message = '';
		let empty = [];
		var table_id = (required.hasOwnProperty('id')) ? required.id : 0;
		// console.log(table_id);
		// return;
		let table_name = (required.hasOwnProperty('table_name')) ? required.table_name : 'users';
		for (let key in required) {
			if (required.hasOwnProperty(key)) {
				if (required[key] == undefined || required[key] == '') {
					empty.push(key);
				}
			}
		}
				// console.log(empty);
		
				// console.log(required.security_key);
			

		if (empty.length != 0) {
			message = empty.toString();
			if (empty.length > 1) {
				message += " fields are required"
			} else {
				message += " field is required"
			}
			if(required.security_key != 'barmate' && required.security_key){
				message='Invalid security_key';			
				
			}
			res.status(400).json({
				'success': false,
				'error_message': message,
				'code': 400,
				'body': []
			});
			
			return;
		} else {
			if (required.hasOwnProperty('password')) {
				required.password = this.crypt(required.password);
			}
			if (required.hasOwnProperty('auth_key')) {
				if (!await this.checking_availability(required.auth_key, 'authorization_key', table_name)) {
					message = "invalid auth key";
					res.status(403).json({
						'success': false,
						'error_message': message,
						'code': 403,
						'body': []
					});
					return false;
				}
			}
			if (required.hasOwnProperty('checkexit')) {
				if (required.checkexit === 1) {
					if (required.hasOwnProperty('email')) {
						if (await this.checking_availability(required.email, 'email', table_name,table_id)) {
							message = "This email is already register kindly use another";
							res.status(403).json({
								'success': false,
								'error_message': message,
								'code': 403,
								'body': []
							});
							return false;
						}
					}
				}
			}
			for (var key in non_required) {
				if (non_required.hasOwnProperty(key)) {

					if (non_required[key] == undefined || non_required[key] == '' || non_required[key] == 0) {
						// console.log(key); 
						
						delete non_required[key];						
					}					
				} 
			} 
			// console.log(non_required); 
			// final_non_required =Object.assign(final_non_required, final_non_required);
			const marge_object = Object.assign(required, non_required);
			delete marge_object.checkexit;
			// console.log(marge_object); 
			// return;
			return marge_object;
		}
	}

	async checking_availability(value, key, table_name,table_id=0) {
		// table_name='users'
		// console.log(table_name);
		var row = await db[table_name].findOne({
			where: {
				id :{$not: table_id},
				[key]: value
			}
			});
			// console.log(row);
			// return;
		if (row) {
			// console.log('exist');
			// return;
			return true;
		} else {
			// console.log('eNot exist');
			// return;
			return false;
		}
	}

   async send_mail(object) {
		try {
			var transporter = nodemailer.createTransport(contant.mail_auth);
			var mailOptions = object;
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
		} catch (err) {
			throw err;
		}
	}
	time() {
		var time = Date.now();
		var n = time / 1000;
		return time = Math.floor(n);
	}

	send_notification(data) {
		try {
			let dtas = { ...data };
			delete dtas.device_token;

			var serverKey = 'AAAAA1SQ0L8:APA91bFJe_DOFqc5jvbV1uYFu0LwkaRCLhunNYlSshKocV6w0fsB0Mac20zd5FS9KQmPhxidyqrepcVbL5FfQHS31P0ff7gD7E23SvoMhD7T8afAAtOESjeZWQfqEE-PcIRQaKivP-a_';

			var fcm = new FCM(serverKey);
			var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
				to: data.device_token,
				notification: {
					title: 'Challenge Request',
					body: 'You have been challenged to ' + data.title + ' challange by ' + data.u_username,
				},

				data: {  //you can send only notification or only data(or include both)
					id: dtas.id,
					titel: dtas.title,
					description: dtas.description,
					user_id: dtas.user_id,
					start_date: dtas.start_date,
					end_date: dtas.end_date,
					name: dtas.name,
					prize: dtas.prize,
					time_per_week: dtas.time_per_week,
					photo: dtas.photo,
					stop_challange_entry: dtas.stop_challange_entry,
					is_private: dtas.is_private,
					created: dtas.created,
					is_deleted: dtas.is_deleted,
					attempt_users: dtas.attempt_users,
					completed_challengers: dtas.completed_challengers,
					total_users: dtas.total_users,
					u_username: dtas.u_username,
					image_url: contant.image_url

				}
			};

			fcm.send(message, function (err, response) {

				if (err) {
					console.log("Something has gone wrong!");
				} else {
					console.log("Successfully sent with response: ", response);
				}
			});
		} catch (err) {
			throw err;
		}
	}

	push_notification(data) {
		try {
			if(data.data.device_type == 0){
				data.notification = {
					title: data.data.title,
					body: data.data.body,
					"sound" : "default",
					badge : 1
				};
			}
			var serverKey = 'AAAAPo-Wumw:APA91bGTYPXa8Sa0Lmua7p3VSjEgxSY_nRo2uVjfN4eetm2ovnUBb1m9TlKmsmmk-G-xOecnuLsJriTOgFOTpEldo3o0VZAnz2piQ-fBpEepYARgcR8QugZPUtzY3DCojKVrpTSgRSuu';

			var fcm = new FCM(serverKey);
			fcm.send(data, function (err, response) {
				if (err) {
					console.log("Something has gone wrong!",err);
				} else {
					console.log("Successfully sent with response: ", response);
				}
			});
		} catch (err) {
			throw err;
		}
	}



};