var r = require('rethinkdb'),
	config = require('../config');

r.connect(config.rethinkdb).then(function(conn) {
	r
	.table('messages')
	.forEach(function(doc) {
		return r.db('dermail').table('messages').update({
			headers: doc('header')
		})
	})
	.run(conn)
	.then(function() {
		return r
		.db('dermail')
		.table('messages')
		.replace(r.row.without('header'))
		.run(conn)
	})
})
