var jwt = require('jwt-simple'),
	bcrypt = require("bcrypt");

module.exports = function(app, r, config) {
	app.post('/api/login', function(req, res, next) {

		var username = req.body.username;
		var password = req.body.password;

		if (!username || !password) {
			return res.status(400).send({message: 'Username and password are required'});
		}

		return r
		.table('users')
		.getAll(username, {index: 'username'})
		.run(r.conn)
		.then(function(cursor) {
			return cursor.toArray();
		})
		.then(function(user) {
			if (user.length === 0) {
				return res.status(403).send({message: 'Username or Password incorrect'});
			}
			bcrypt.compare(password, user[0].password, function(err, result) {
				if (!result) {
					return res.status(403).send({message: 'Username or Password incorrect'});
				}else{
					return res.status(200).send({token: jwt.encode({
						userId: user[0].userId
					}, config.jwt.secret)});
				}
			})
		})
		.error(function(e) {
			return next(e);
		})
	});
}
