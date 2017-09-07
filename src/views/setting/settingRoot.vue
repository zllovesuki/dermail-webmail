<template>
	<div>
		<div class="ml1 mt1 mb1">
			<span class="btn button-narrow mxn2 muted" v-link="{ name: 'settingIndex' }">S</span>
			<chevron-right></chevron-right>
			<span v-if="isInSPFDKIMDMARC">
				<span class="btn button-narrow mxn1" v-link="{ name: 'settingSPFDKIMDMARC' }">
					SPF, DKIM, and DMARC
				</span>
			</span>
			<span v-if="isInPushNotification">
				<span class="btn button-narrow mxn1" v-link="{ name: 'settingPushNotification' }">
					Push Notification
				</span>
			</span>
            <span v-if="isInSpamFilter">
				<span class="btn button-narrow mxn1" v-link="{ name: 'settingSpamFilter' }">
    				Spam Filter
				</span>
			</span>
			<span v-if="isInColor">
				<span class="btn button-narrow mxn1" v-link="{ name: 'settingColor' }">
					Color
				</span>
			</span>
		</div>
		<div class="mt2 mb1">
			<router-view transition="fade"></router-view>
		</div>
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
	computed: {
		isInPushNotification: function() {
			return this.route.name === 'settingPushNotification'
		},
        isInSpamFilter: function() {
			return this.route.name === 'settingSpamFilter'
		},
		isInColor: function() {
			return this.route.name === 'settingColor'
		},
		isInSPFDKIMDMARC: function() {
			return this.route.name === 'settingSPFDKIMDMARC'
		}
	},
}
</script>
