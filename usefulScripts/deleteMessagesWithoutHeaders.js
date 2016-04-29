var r = require('rethinkdb'),
	config = require('../config'),
	async = require('async');

var messages = [];
var exist = [];
var notExist = [];

r.connect(config.rethinkdb).then(function(conn) {
	r
	.db('dermail')
	.table('messages')
	.pluck('headers', 'messageId')
	.run(conn)
	.then(function(cursor) {
		return cursor.toArray();
	})
	.then(function(result) {
		messages = result;
		async.forEach(messages, function(each, cb) {
			r
			.db('dermail')
			.table('messageHeaders')
			.get(each.headers)
			.run(conn)
			.then(function(_) {
				if (_ !== null) {
					exist.push(_.headerId);
				}else{
					notExist.push(each.messageId);
				}
				cb();
			})
		}, function(err) {
			console.log(exist);
			console.log(notExist);
			async.forEach(notExist, function(id, cb) {
				r
				.db('dermail')
				.table('messages')
				.get(id)
				.delete()
				.run(conn)
				.then(function(result) {
					cb();
				})
			}, function(err) {
				conn.close();
			})
		})
	})
});
