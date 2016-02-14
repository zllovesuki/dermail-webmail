var r = require('rethinkdb'),
	config = require('./config'),
	async = require('async');

var headers = [];
var exist = [];
var notExist = [];

r.connect(config.rethinkdb).then(function(conn) {
	r
	.db('dermail')
	.table('messageHeaders')
	.getField('messageId')
	.run(conn)
	.then(function(cursor) {
		return cursor.toArray();
	})
	.then(function(result) {
		headers = result;
		async.forEach(headers, function(each, cb) {
			r
			.db('dermail')
			.table('messages')
			.get(each)
			.run(conn)
			.then(function(_) {
				if (_ !== null) {
					exist.push(each);
				}else{
					console.log('Header with message id ' + each + ' does not has a corresponding message entry');
					notExist.push(each);
				}
				cb();
			})
		}, function(err) {
			async.forEach(notExist, function(id, cb) {
				r
				.db('dermail')
				.table('messageHeaders')
				.getAll(id, {index: 'messageId'})
				.delete()
				.run(conn)
				.then(function(result) {
					console.log('Header with message id ' + id + ' deleted');
					cb();
				})
			}, function(err) {
				conn.close();
			})
		})
	})
});
