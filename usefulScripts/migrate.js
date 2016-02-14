var r = require('rethinkdb'),
	config = require('./config');

r.connect(config.rethinkdb).then(function(conn) {
	r.db('dermail')
				.table('messages')
				.eqJoin('messageId',
						r.db('dermail')
						.table('messageHeaders'),
						{
							index: 'messageId'
						}
				)
				.without({right: ['to', 'from', 'date', 'accountId'], left: ['text', 'html']}) // no annoying override in headers and text in mail
				.zip() // Noice
				.pluck('messageId', 'date', 'to', 'from', 'folderId', 'accountId', 'subject', 'html', 'attachments', 'isRead', 'isStar')
		  .run(conn)
		  .then(function(cursor) {
			  return cursor.toArray();
		  })
		  .then(function(result) {
			  result.forEach(function(message) {
				  message.to.forEach(function(address) {
					 return r
					  .table('addresses')
					  .get(address)
					  .update({
						  accountId: message.accountId
					  })
					  .run(conn)
					  .then(function(xx) {
						  console.log(xx)
					  })
				  })
				  message.from.forEach(function(address) {
					 return r
					  .table('addresses')
					  .get(address)
					  .update({
						  accountId: message.accountId
					  })
					  .run(conn)
					  .then(function(xx) {
						  console.log(xx)
					  })
				  })
			  })
		  })
});
