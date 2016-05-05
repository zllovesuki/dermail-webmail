<template>
	<div>
		<div class="mt2 mb2">
			<span class="btn button-narrow" v-link="{ name: 'settings' }">Settings</span>
			<chevron-right></chevron-right>
		</div>
		<div class="mt2 mb2">
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
						<button type="submit" class="h6 btn btn-outline {{ st.color }} mr2" v-if="canSubscribe" :disabled="disabled" @click="subscribe">
							Subscribe
						</button>
						<button type="submit" class="h6 btn btn-outline {{ st.color }} mr2" v-if="canUnsubscribe" :disabled="disabled" @click="unsubscribe">
							Unsubscribe
						</button>
						<button type="submit" class="h6 btn btn-outline {{ st.color }} mr2" v-if="canUnsubscribe" :disabled="disabled" @click="test">
							Send a test notification
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="mt2 mb2">
			<div class="overflow-hidden bg-white rounded mb2">
				<div class="m0 p1">
					<div class="clearfix">
						<span class="btn black h5">Color Scheme: </span>
					</div>
					<div class="clearfix">
						<span class="ml1 btn black h6 muted not-clickable">You can change the color scheme of the interface.</span>
					</div>
				</div>
				<div class="m0 p2 border-top">
					<div class="clearfix">
						<select class="block col-3 mb2 field" v-model="st.color">
							<option v-for="color in st.colors" value="{{ color }}">{{ color }}</option>
						</select>
						<button class="h6 btn btn-outline {{ st.color }}" @click="saveColor">Save</button>
					</div>
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
		saveColor: function() {
			//this.st.setBarColor(this.st.color);
			var colorCode = this.st.getStyleRuleValue('color', '.' + this.st.color);
			this.st.loading = new this.st.Nanobar({ bg: colorCode, id: 'nanobar'});
			localStorage.setItem('color', this.st.color);
			this.st.alert.success('Color scheme saved!');
		},
		subscribe: function(e) {
			var that = this;
			that.disabled = true;
			this.st.loading.go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				that.st.loading.go(50);
				serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
				.then(function(subscription) {
					var payload = JSON.stringify(subscription);
					that.st.loading.go(70);
					api.pushNotification(that, {
						action: 'subscribe',
						payload: payload
					}).then(function() {
						that.disabled = false;
						that.canSubscribe = false;
						that.canUnsubscribe = true;
						that.st.alert.success('Subscribed!');
						that.st.loading.go(100);
					}, function(res) {
						that.disabled = false;
						console.log(res);
						that.st.alert.error('API Error!');
						that.st.loading.go(100);
					})
				})
				.catch(function(e) {
					console.log(e);
					that.disabled = false;
					that.st.alert.error('Error!')
					that.st.loading.go(100);
				})
			})
		},
		unsubscribe: function(e) {
			var that = this;
			that.disabled = true;
			this.st.loading.go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				that.st.loading.go(50);
				serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(subscription) {
					that.st.loading.go(70);
					if (subscription) {
						var payload = JSON.stringify(subscription);
						api.pushNotification(that, {
							action: 'unsubscribe',
							payload: payload
						}).then(function() {
							return subscription.unsubscribe().then(function(successful) {
								that.disabled = false;
								that.canSubscribe = true;
								that.canUnsubscribe = false;
								that.st.alert.success('Unsubscribed!');
								that.st.loading.go(100);
							})
						}, function(res) {
							that.disabled = false;
							console.log(res);
							that.st.alert.error('API Error!');
							that.st.loading.go(100);
						})
					}else{
						that.disabled = false;
						that.st.loading.go(100); // Oh well
					}
				})
			})
		},
		test: function() {
			var that = this;
			this.st.loading.go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				that.st.loading.go(50);
				serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(subscription) {
					that.st.loading.go(70);
					if (subscription) {
						var payload = JSON.stringify(subscription);
						api.pushNotification(that, {
							action: 'test',
							payload: payload
						}).then(function() {
							that.st.alert.success('Test notification sent!');
							that.st.loading.go(100);
						}, function(res) {
							that.st.alert.error('API Error!');
							that.st.loading.go(100);
						})
					}else{
						that.st.alert.error('Not subscribed.');
						that.st.loading.go(100); // Oh well
					}
				})
			})
		}
	},
	beforeCompile: function() {
		this.st.setTitle('Settings');
	},
	ready: function() {
		this.st.loading.go(100);
		var that = this;
		if ('serviceWorker' in navigator) {
			var sw = navigator.serviceWorker.register('/sw.js');
			sw.then(function(registration) {
				registration.pushManager.getSubscription()
				.then(function(subscription) {
					if (!subscription) {
						that.canSubscribe = true;
					}else{
						that.canUnsubscribe = true;
					}
				})
				return;
			})
			.catch(function(error) {
				that.disabled = true;
				that.st.alert.error(error);
			});
		}
	}
}
</script>
