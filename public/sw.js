function getEndpoint() {
	return self.registration.pushManager.getSubscription()
		.then(function(subscription) {
			if (subscription) {
				return subscription.endpoint;
			}

			throw new Error('User not subscribed');
		});
}

self.addEventListener("push", function(event){

	if (event.data) {
		var payload = event.data.json();
		event.waitUntil(
			self.registration.showNotification("New Mail", {
				body: payload.message,
				data: payload,
				icon: './mail_256x256.png',
				vibrate: [300, 100, 300]
			})
		)
	}else{
		event.waitUntil(
			getEndpoint()
			.then(function(endpoint) {
				return fetch('./api/getPayload?endpoint=' + endpoint);
			})
			.then(function(response) {
				return response.json();
			}).then(function(payload) {
				return self.registration.showNotification("New Mail", {
					body: payload.message,
					data: payload,
					icon: './mail_256x256.png',
					vibrate: [300, 100, 300]
				})
			})
		)
	}

});

self.addEventListener('notificationclick', function(event) {
	var data = event.notification.data;
	event.notification.close();
	event.waitUntil(clients.matchAll({
		type: "window"
	}).then(function(clientList) {
		for (var i = 0; i < clientList.length; i++) {
			var client = clientList[i];
			if (client.url == 'https://dermail.net/#!/accounts/' + data.accountId && 'focus' in client)
				return client.focus();
    	}
		if (clients.openWindow) {
			return clients.openWindow('https://dermail.net/#!/accounts/' + data.accountId);
		}
	}));
});
