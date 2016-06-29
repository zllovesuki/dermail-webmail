<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">General: </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">General functionalities such as color scheme.</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" v-link="{ name: 'settingColor' }">Color Scheme</a>
				</div>
			</div>
		</div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">Push Notifications: </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">Settings for push notifications.</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" v-link="{ name: 'settingPushNotification' }">Push Notification</a>
				</div>
			</div>
		</div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">Security: </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">Safeguarding your emails' authenticity and integrity.</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" v-link="{ name: 'settingSPFDKIMDMARC' }">SPF, DKIM, and DMARC</a>
				</div>
			</div>
		</div>
	</div>
</template>
<script>

var api = require('../../lib/api.js');
var st = require('../../lib/st.js');

module.exports = {
	data: function() {
		return {
			st: st
		}
	},
	ready: function() {
		this.st.loading.go(100);
		this.st.setTitle('Settings');
	}
}
</script>
