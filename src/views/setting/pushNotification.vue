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
					<button type="submit" class="h6 btn btn-outline {{ color }} ml1 mb1" v-if="canSubscribe" :disabled="disabled" @click="subscribe">
						Subscribe
					</button>
					<button type="submit" class="h6 btn btn-outline {{ color }} ml1 mb1" v-if="canUnsubscribe" :disabled="disabled" @click="unsubscribe">
						Unsubscribe
					</button>
					<button type="submit" class="h6 btn btn-outline {{ color }} ml1 mb1" v-if="canUnsubscribe" :disabled="disabled" @click="test">
						Send a test notification
					</button>
				</div>
			</div>
		</div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">Per account setting: </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">
						You can disable notifications for a particular account (e.g. account only for promotion).
					</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<span class="btn black h5">Account Status: </span>
				</div>
				<div class="clearfix">
					<table class="h6 col col-12">
						<template v-for="account in accounts" track-by="accountId">
							<tr>
								<td class="col col-6">
									<span class="btn not-clickable left">{{ account.account }}@{{ account.domain }}</span>
								</td>
								<td class="col col-6">
									<button v-if="account.notify === false" type="button" class="right bold btn btn-outline {{ color }}" @click="popupEnableNotify(account.accountId)">Disabled</span>
									<button v-if="account.notify === true" type="button" class="right bold btn btn-outline {{ color }}" @click="popupDisableNotify(account.accountId)">Enabled</span>
								</td>
							</tr>
						</template>
					</table>
				</div>
			</div>
		</div>
		<modal :show.sync="enableNotifyModal">
			<h4 slot="header">Enabling Notification</h4>
			<span slot="body">
				<span class="block mb2 h5">Currently Dermail will <b>not</b> notify new mails for this account.</span>
				<button type="button" class="btn btn-primary h5" :disabled="disableNotifyButton" @click="enableNotify">Enable</button>
			</span>
		</modal>
		<modal :show.sync="disableNotifyModal">
			<h4 slot="header">Disabling Notification</h4>
			<span slot="body">
				<span class="block mb2 h5">You can disable new mails for this account.</span>
				<button type="button" class="btn btn-primary h5" :disabled="disableNotifyButton" @click="disableNotify">Disable</button>
			</span>
		</modal>
	</div>
</template>

<script>

var getters = require('../../lib/vuex/getters.js')
var actions = require('../../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
	data: function() {
		return {
			canSubscribe: false,
			canUnsubscribe: false,
			disabled: false,
			enableNotifyModal: false,
			disableNotifyModal: false,
			disableNotifyButton: false,
			accountId: null
		}
	},
	methods: {
		subscribe: function(e) {
			this.disabled = true;
			this.loading().go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				this.loading().go(50);
				serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
				.then(function(subscription) {
					var payload = JSON.stringify(subscription);
					this.loading().go(70);
					return this.pushNotification({
						action: 'subscribe',
						payload: payload
					})
					.then(function() {
						this.canSubscribe = false;
						this.canUnsubscribe = true;
						this.alert().success('Subscribed!');
					})
					.finally(function() {
						this.disabled = false;
						this.loading().go(100);
					}.bind(this))
				}.bind(this))
				.catch(function(e) {
					console.log(e);
					this.disabled = false;
					this.alert().error('Error!')
					this.loading().go(100);
				}.bind(this))
			}.bind(this))
		},
		unsubscribe: function(e) {
			this.disabled = true;
			this.loading().go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				this.loading().go(50);
				serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(subscription) {
					this.loading().go(70);
					if (subscription) {
						var payload = JSON.stringify(subscription);
						return this.pushNotification({
							action: 'unsubscribe',
							payload: payload
						})
						.then(function() {
							return subscription.unsubscribe().then(function(successful) {
								this.canSubscribe = true;
								this.canUnsubscribe = false;
								this.alert().success('Unsubscribed!');
							}.bind(this))
						}.bind(this))
						.finally(function() {
							this.disabled = false;
							this.loading().go(100);
						}.bind(this))
					}else{
						this.disabled = false;
						this.loading().go(100); // Oh well
					}
				}.bind(this))
			}.bind(this))
		},
		test: function() {
			this.loading().go(30);
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				this.loading().go(50);
				serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(subscription) {
					this.loading().go(70);
					if (subscription) {
						var payload = JSON.stringify(subscription);
						return this.pushNotification({
							action: 'test',
							payload: payload
						})
						.then(function() {
							this.alert().success('Test notification sent!');
							this.loading().go(100);
						}.bind(this))
						.catch(function(res) {
							this.alert().error('API Error!');
							this.loading().go(100);
						}.bind(this))
					}else{
						this.alert().error('Not subscribed.');
						this.loading().go(100); // Oh well
					}
				}.bind(this))
			}.bind(this))
		},
		fetchAccounts: function() {
			this.getAccounts()
			.then(function() {
				this.loading().go(100);
			}.bind(this))
		},
		popupEnableNotify: function(accountId) {
			this.accountId = accountId;
			this.enableNotifyModal = true;
		},
		popupDisableNotify: function(accountId) {
			this.accountId = accountId;
			this.disableNotifyModal = true;
		},
		disableNotify: function() {
			this.loading().go(30);
			this.disableNotifyButton = true;
			var payload = JSON.stringify({
				accountId: this.accountId
			}); // compatibility
			return this.pushNotification({
				action: 'disableNotify',
				payload: payload
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.disableNotifyModal = false;
				this.alert().success('Notification disabled.');
			})
			.finally(function() {
				this.disableNotifyButton = false;
				this.fetchAccounts();
			})
		},
		enableNotify: function() {
			this.loading().go(30);
			this.disableNotifyButton = true;
			var payload = JSON.stringify({
				accountId: this.accountId
			}); // compatibility
			return this.pushNotification({
				action: 'enableNotify',
				payload: payload
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.enableNotifyModal = false;
				this.alert().success('Notification enabled.');
			})
			.finally(function() {
				this.disableNotifyButton = false;
				this.fetchAccounts();
			})
		}
	},
	beforeCompile: function() {
		this.setTitle('Push Notifications');
	},
	ready: function() {
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
				this.alert().error(error);
			}.bind(this))
		}
		this.fetchAccounts();
	}
}
</script>
