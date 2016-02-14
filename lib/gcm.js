var push = require('web-push'),
	crypto = require('crypto');

module.exports = function(r, config) {

	push.setGCMAPIKey(config.gcm_api_key);

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

								var params = {};
								var payload = {
									message: queue.message,
									accountId: queue.accountId
								};
								var notify = function(ep, pa) {
									push.sendNotification(ep, pa);
								}

								if (typeof subscription.keys !== 'undefined') {
									params = {
										userPublicKey: subscription.keys.p256dh,
										userAuth: subscription.keys.auth,
										payload: JSON.stringify(payload)
									};
									return notify(subscription.endpoint, params);
								}else {
									var hash = crypto.createHash('sha1').update(subscription.endpoint).digest("hex");

									savePayload(r, hash, payload).then(function() {
										return notify(subscription.endpoint, params);
									})
								}
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

var savePayload = function(r, endpoint, payload) {
	return r
	.table('payload')
	.insert({
		endpoint: endpoint,
		payload: payload
	})
	.run(r.conn)
}
