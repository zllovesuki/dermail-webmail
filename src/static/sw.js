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
        payload.single = true;
		if (notifications && notifications.length > 0) {
            payload.single = false;
			var notificationCount = 1;
			for (var i = 0; i < notifications.length; i++) {
				var existingNotification = notifications[i];
				if (existingNotification.data && existingNotification.data.notificationCount) {
					notificationCount += existingNotification.data.notificationCount;
				} else {
					notificationCount++;
				}
                if (payload.remove === true && existingNotification.data.messageId !== payload.messageId) continue;
                existingNotification.close();
			}
			delete payload.folder;
			if (typeof payload._account === 'undefined') payload._account = payload.header.substring(payload.header.indexOf(':') + 1);
			payload.header = 'New Mails';
			payload.body = 'You have ' + notificationCount + ' new emails in' + payload._account;
			payload.notificationCount = notificationCount;
		}
        if (payload.remove === true) return;
		return notify(payload, tag);
	});
}

function notify(payload, tag) {
    var actions = [];
    if (payload.single === true && payload.verify) {
        actions = [{
            action: 'read',
            title: 'Mark Read'
        }]
    }
	return self.registration.showNotification(payload.header, {
		body: payload.body,
		data: payload,
		icon: '/public/mail_256x256.png',
		tag: tag,
        actions: actions,
		vibrate: [300, 100, 300]
	})
}

function getData(event) {
	return new Promise(function(resolve, reject) {
		if (event.data) {
			var payload = event.data.json();
			return resolve(payload);
		}else{
			return reject('Deprecated')
		}
	})
}

self.addEventListener("push", function(event){
	event.waitUntil(getData(event).then(countNotificationsAndNotify).catch(function(e) {console.log(e)}))
});

self.addEventListener('notificationclick', function(event) {
	var data = event.notification.data;
	event.notification.close();
	event.waitUntil(clients.matchAll({
		type: "window"
	}).then(function(clientList) {
        if (event.action === 'read' && data.verify) {
            // mark read
            return fetch('__APIENDPOINT__/write/swActions', {
                method: 'POST',
                mode: 'cors',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    verify: data.verify,
                    action: 'read'
                })
            })
        }
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
