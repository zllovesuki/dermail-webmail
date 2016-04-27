helper = require('../lib/helper'),

module.exports = function(r, config) {
	r
	.table('queue')
	.changes()
	.run(r.conn)
	.then(function(cursor) {
		cursor.each(function(err, result) {
			var queue = result.new_val;
			if (queue !== null) {
				if (queue.type === 'new') {
					var userId = queue.userId;
					r
					.table('pushSubscriptions')
					.get(userId)
					.run(r.conn)
					.then(function(result) {
						if (result !== null) {
							var subscriptions = result.subscriptions;
							subscriptions.forEach(function(subscription) {
								helper.sendNotification(r, {
									message: queue.message,
									accountId: queue.accountId
								}, subscription);
							});
						}
					})
				}
				snapchat(r, queue.queueId);
			}
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
