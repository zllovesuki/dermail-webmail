var r = require('rethinkdb'),
	config = require('./config');

r.connect(config.rethinkdb).then(function(conn) {
	r.db('dermail')
	.table('messages')
	.run(conn)
	.then(function(cursor) {
		cursor.each(function(err, res) {
			if (typeof res.date.toISOString === 'function') {
				r.db('dermail')
				.table('messages')
				.get(res.messageId)
				.update({
					date: res.date.toISOString()
				})
				.run(conn)
				.then(function(result) {
					console.log(result);
				})
			}	
		})
	})
});
