<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">Push Notifications: </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">By utilizing Google Cloud Messaging, Dermail will send push notification to your device when new mails arrive. (Chrome 42+)</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<button type="submit" class="h6 btn btn-outline {{ st.color }} ml1 mb1" v-if="canSubscribe" :disabled="disabled" @click="subscribe">
						Subscribe
					</button>
					<button type="submit" class="h6 btn btn-outline {{ st.color }} ml1 mb1" v-if="canUnsubscribe" :disabled="disabled" @click="unsubscribe">
						Unsubscribe
					</button>
					<button type="submit" class="h6 btn btn-outline {{ st.color }} ml1 mb1" v-if="canUnsubscribe" :disabled="disabled" @click="test">
						Send a test notification
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

var st = require('../../lib/st.js');
var api = require('../../lib/api.js');

module.exports = {
	data: function() {
		return {
			st: st,
			canSubscribe: false,
			canUnsubscribe: false,
			disabled: false
		}
	},
	methods: {
		subscribe: function(e) {
			this.disabled = true;
			this.st.loading.go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				this.st.loading.go(50);
				serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
				.then(function(subscription) {
					var payload = JSON.stringify(subscription);
					this.st.loading.go(70);
					api.pushNotification(this, {
						action: 'subscribe',
						payload: payload
					})
					.then(function() {
						this.canSubscribe = false;
						this.canUnsubscribe = true;
						this.st.alert.success('Subscribed!');
					})
					.finally(function() {
						this.disabled = false;
						this.st.loading.go(100);
					}.bind(this))
				}.bind(this))
				.catch(function(e) {
					console.log(e);
					this.disabled = false;
					this.st.alert.error('Error!')
					this.st.loading.go(100);
				}.bind(this))
			}.bind(this))
		},
		unsubscribe: function(e) {
			this.disabled = true;
			this.st.loading.go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				this.st.loading.go(50);
				serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(subscription) {
					this.st.loading.go(70);
					if (subscription) {
						var payload = JSON.stringify(subscription);
						api.pushNotification(this, {
							action: 'unsubscribe',
							payload: payload
						})
						.then(function() {
							return subscription.unsubscribe().then(function(successful) {
								this.canSubscribe = true;
								this.canUnsubscribe = false;
								this.st.alert.success('Unsubscribed!');
							}.bind(this))
						}.bind(this))
						.finally(function() {
							this.disabled = false;
							this.st.loading.go(100);
						}.bind(this))
					}else{
						this.disabled = false;
						this.st.loading.go(100); // Oh well
					}
				}.bind(this))
			}.bind(this))
		},
		test: function() {
			this.st.loading.go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				this.st.loading.go(50);
				serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(subscription) {
					this.st.loading.go(70);
					if (subscription) {
						var payload = JSON.stringify(subscription);
						api.pushNotification(this, {
							action: 'test',
							payload: payload
						})
						.then(function() {
							this.st.alert.success('Test notification sent!');
							this.st.loading.go(100);
						}.bind(this))
						.catch(function(res) {
							this.st.alert.error('API Error!');
							this.st.loading.go(100);
						}.bind(this))
					}else{
						this.st.alert.error('Not subscribed.');
						this.st.loading.go(100); // Oh well
					}
				}.bind(this))
			}.bind(this))
		}
	},
	beforeCompile: function() {
		this.st.setTitle('Push Notifications');
	},
	ready: function() {
		this.st.loading.go(100);
		if ('serviceWorker' in navigator) {
			var sw = navigator.serviceWorker.register('/sw.js');
			sw.then(function(registration) {
				registration.pushManager.getSubscription()
				.then(function(subscription) {
					if (!subscription) {
						this.canSubscribe = true;
					}else{
						this.canUnsubscribe = true;
					}
				}.bind(this))
				return;
			}.bind(this))
			.catch(function(error) {
				this.disabled = true;
				this.st.alert.error(error);
			}.bind(this))
		}
	}
}
</script>
