function getEndpoint() {
	return self.registration.pushManager.getSubscription()
		.then(function(subscription) {
			if (subscription) {
				return subscription.endpoint;
			}

			throw new Error('User not subscribed');
		});
}

function countNotificationsAndNotify(payload) {
	var tag = payload.accountId || 'notification';
	return self.registration.getNotifications({ tag: tag })
	.then(function(notifications) {
		if (notifications && notifications.length > 0) {
			var notificationCount = 1;
			for (var i = 0; i < notifications.length; i++) {
				var existingNotification = notifications[i];
				if (existingNotification.data && existingNotification.data.notificationCount) {
					notificationCount += existingNotification.data.notificationCount;
				} else {
					notificationCount++;
				}
				existingNotification.close();
			}
			delete payload.folder;
			if (typeof payload._account === 'undefined') payload._account = payload.header.substring(payload.header.indexOf(':') + 1);
			payload.header = 'New Mails';
			payload.body = 'You have ' + notificationCount + ' new emails in' + payload._account;
			payload.notificationCount = notificationCount;
		}
		return notify(payload, tag);
	});
}

function notify(payload, tag) {
	return self.registration.showNotification(payload.header, {
		body: payload.body,
		data: payload,
		icon: '/public/mail_256x256.png',
		tag: tag,
		vibrate: [300, 100, 300]
	})
}

function getData(event) {
	return new Promise(function(resolve, reject) {
		if (event.data) {
			var payload = event.data.json();
			return resolve(payload);
		}else{
			return getEndpoint()
			.then(function(endpoint) {
				return fetch('__APIENDPOINT__/read/getPayload?endpoint=' + endpoint, {mode: 'cors'});
			})
			.then(function(response) {
				return response.json();
			})
			.then(function(payload) {
				return resolve(payload);
			})
			.catch(reject);
		}
	})
}

self.addEventListener("push", function(event){
	event.waitUntil(getData(event).then(countNotificationsAndNotify))
});

self.addEventListener('notificationclick', function(event) {
	var data = event.notification.data;
	event.notification.close();
	event.waitUntil(clients.matchAll({
		type: "window"
	}).then(function(clientList) {
		if (!!data.folder && !!data.accountId) {
			if (clients.openWindow) {
				return clients.openWindow('__SITEURL__/accounts/' + data.accountId + '/' + data.folder.folderId + '/' + data.messageId);
			}
		}else if(!!data.accountId) {
			if (clients.openWindow) {
				return clients.openWindow('__SITEURL__/accounts/' + data.accountId);
			}
		}else{
			// do nothing
			return;
		}
	}));
});
