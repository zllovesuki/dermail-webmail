var r = require('rethinkdb'),
	config = require('../config');

r.connect(config.rethinkdb).then(function(conn) {
	r
	.db('dermail')
	.tableCreate('filters', {
		primaryKey: 'filterId'
	})
	.run(conn)
	.then(function() {
		return r
		.db('dermail')
		.table('filters')
		.indexCreate('accountId')
		.run(conn)
	})
});
