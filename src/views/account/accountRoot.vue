<template>
	<div>
		<div class="ml1 mt1 mb1">
			<span class="btn button-narrow mxn2 muted" v-link="{ name: 'accounts' }">A</span>
			<chevron-right></chevron-right>
			<span v-if="isInSecurity">
				<span class="btn button-narrow mxn1" v-link="{ name: 'security' }">
					Security
				</span>
			</span>
			<span v-if="$route.params.accountId">
				<span class="btn button-narrow mxn1" v-link="{ name: 'account', params: { accountId: $route.params.accountId } }">
					{{ account.displayName }}
				</span>
				<span v-if="isInCompose">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'compose', params: { accountId: $route.params.accountId } }">
						Compose
					</span>
				</span>
				<span v-if="isInFilter">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'filter', params: { accountId: $route.params.accountId } }">
						Filter
					</span>
				</span>
				<span v-if="$route.params.folderId">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'folder', params: { accountId: $route.params.accountId, folderId: $route.params.folderId } }">
						{{ folder.displayName }}
					</span>
				</span>
				<span v-if="isInFolder && folder.displayName">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" @click="flipStarOnly">
						{{ starOnly === true ? '&#9733;': '&#9734;' }}
					</span>
				</span>
				<span v-if="isInAddressBook">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'addresses', params: { accountId: $route.params.accountId } }">
						Address Book
					</span>
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
		isInCompose: function() {
			return this.$route.name === 'compose'
		},
		isInFilter: function() {
			return this.$route.name === 'filter'
		},
		isInFolder: function() {
			return this.$route.name === 'folder'
		},
		isInSecurity: function() {
			return this.$route.name === 'security'
		},
		isInAddressBook: function() {
			return this.$route.name === 'addresses'
		}
	},
	methods: {
		flipStarOnly: function(e) {
			this.st.starOnly = !this.st.starOnly;
			this.$broadcast('reloadFolder');
		}
	},
	events: {
		'setStarInMailArray': function(messageId, star, cb) {
			var mail = this.st.mails.filter(function(mail) {
				return mail.messageId === messageId;
			})
			if (mail.length === 1) {
				mail[0].isStar = star;
			}
		},
		'setReadInMailArray': function(messageId, read, cb) {
			var mail = this.st.mails.filter(function(mail) {
				return mail.messageId === messageId;
			})
			if (mail.length === 1) {
				mail[0].isRead = read;
			}
		},
		'houseKeeping': function(folderId, messageId, redirectToFolder) {
			var message = document.getElementsByClassName('mail-' + messageId)[0];
			var redirectToFolder = !!redirectToFolder;

			this.st.mails = this.st.mails.filter(function(e) {
				return e.messageId !== messageId; // remove by value
			})

			if (typeof message !== 'undefined') { // We are in folder view
				if (this.st.mails.length === 0) { // We just removed the last one!
					this.st.noMailsLeft = true;
				}
			}else{ // We are in mail view
				if (redirectToFolder)
					this.$route.router.go({ name: 'folder', params: { accountId: this.$route.params.accountId, folderId: folderId } })
				else
					this.$route.router.go({ name: 'mail', params: { accountId: this.st.mail.accountId, folderId: folderId, messageId: this.st.mail.messageId } })
			}
		}
	}
}
</script>
