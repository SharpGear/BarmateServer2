const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const db = require('../models');

const Venu = db.venues;
const opts = {};

opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

module.exports = passport => {
	passport.use(new JWTStrategy(opts, async (jwt_payload, done) => {
		console.log('in passport file');
		try {
			const getVenu = await Venu.findOne(
				{
					where: {
						id: jwt_payload.id,
						email: jwt_payload.email
					}
				});

			if (getVenu) {
				return done(null, getVenu.dataValues);
			}
			
			return done(null, false);
		} catch (e) {
			console.log('not local');
			console.error(e);
		}
	}));
}