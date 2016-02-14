var socketioJwt = require('socketio-jwt');

module.exports = function(io, r, config) {
	io.sockets
	.on('connection', socketioJwt.authorize({
		secret: config.jwt.secret,
		timeout: 15000
	})).on('authenticated', function(socket) {
		r
		.table('queue')
		.getAll(socket.decoded_token.userId, {index: 'userId'})
		.without('userId')
		.changes()
		.run(r.conn)
		.then(function(cursor) {
			cursor.each(function(err, result) {
				var queue = result.new_val;
				if (queue !== null) {
					if (queue.type === 'notification') {
						socket.emit('Q', queue);
					}
					if (queue.type === 'new') {
						socket.emit('new', queue);
					}
					snapchat(r, queue.queueId);
				}
			});
		});
	});
}

function snapchat(r, queueId) {
	return r
	.table('queue')
	.get(queueId)
	.delete()
	.run(r.conn)
}
