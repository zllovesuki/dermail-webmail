var r = require('rethinkdb'),
	config = require('../config');

r.connect(config.rethinkdb).then(function(conn) {
	r
	.table('messages')
	.map(function(doc) {
		return doc.merge(function() {
			return {
				attachments: r.db('dermail').table('attachments').getAll(doc('messageId'), {index: 'messageId'}).getField('attachmentId').coerceTo('array')
			}
		})
	}).forEach(function(doc) {
		return r.db('dermail').table('messages').get(doc('messageId')).update({
			attachments: doc('attachments')
		})
	})
	.run(conn)
	.then(function() {
		return r
		.db('dermail')
		.table('attachments')
		.replace(r.row.without('messageId', 'accountId'))
		.run(conn)
		.then(function() {
			return r
			.table('attachments')
			.indexDrop('messageId')
			.run(conn)
		})
	})
})
