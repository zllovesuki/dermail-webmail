var bcrypt = require("bcrypt"),
	JwtStrategy = require('passport-jwt').Strategy,
	ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function(config, passport, r) {

	var opts = {}
	opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
	opts.secretOrKey = config.jwt.secret;

	passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
		return r
		.table('users')
		.get(jwt_payload.userId)
		.merge(function(doc) {
			return {
				'accounts': r
							.table('accounts')
							.getAll(
								doc('userId'),
								{
									index: 'userId'
								}
							)
							.concatMap(function(d) {
								return [ d('accountId') ]
							})
							.coerceTo('array')
			}
		})
		.run(r.conn)
		.then(function(user) {
			if (user === null) {
				return done(null, false, {message: 'Credentials are not valid.'});
			}
			delete user.password;
			return done(null, user);
		})
		.error(function(e) {
			return done(e);
		})
	}));
}
