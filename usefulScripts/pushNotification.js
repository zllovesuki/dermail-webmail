var r = require('rethinkdb'),
	config = require('../config');

r.connect(config.rethinkdb).then(function(conn) {
	r
	.db('dermail')
	.table('gcmRegistration')
	.config()
	.update({
		name: "pushSubscriptions"
	})
	.run(conn)
	.then(function() {
		return r
		.db('dermail')
		.table('pushSubscriptions')
		.delete()
		.run(conn)
		.then(function() {
			return r
			.db('dermail')
			.tableCreate('payload', {
				primaryKey: 'endpoint'
			})
			.run(conn)
		})
	})
});
