var r = require('rethinkdb'),
	config = require('../config');

r.connect(config.rethinkdb).then(function(conn) {
	r
	.table('messages')
	.eqJoin('messageId',
		r.db('dermail').table('messageHeaders'), {index: 'messageId'}
	).forEach(function(doc) {
		return r
		.table('messages')
		.get(doc('left')('messageId'))
		.update({
			'header': doc('right')('headerId')
		})
	})
	.run(conn)
	.then(function() {
		return r
		.db('dermail')
		.table('messageHeaders')
		.replace(r.row.without('messageId', 'accountId'))
		.run(conn)
		.then(function() {
			return r
			.table('messageHeaders')
			.indexDrop('messageId')
			.run(conn)
		})
	})
})
