<template>
	<span>
		<a class="h6 btn red" @click="moveToSPAM" v-if="alreadySpam">
			This is a Spam!
		</a>
		<a class="h6 btn green" @click="notSPAM" v-if="!alreadySpam">
			This is NOT a Spam!
		</a>
	</span>
</template>

<script>
var st = require('../lib/st.js');
var api = require('../lib/api.js');

module.exports = {
	props: {
		folderName: {
			type: String,
			required: true
		},
		messageId: {
			type: String,
			required: true
		},
		folderId: {
			type: String,
			required: true
		}
	},
	data: function() {
		return {
			st: st
		}
	},
	computed: {
		alreadySpam: function() {
			return this.folderName.toLowerCase() !== 'spam';
		}
	},
	methods: {
		moveToSPAM: function() {
			var data = {
				accountId: this.$route.params.accountId,
				messageId: this.messageId,
				action: 'spam'
			};
			var currentFolder = this.folderId;
			api.updateMail(this, data).then(function(res) {
				this.st.alert.success('I hate SPAM!');
				this.houseKeeping(currentFolder);
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}
			});
		},
		notSPAM: function() {
			var data = {
				accountId: this.$route.params.accountId,
				messageId: this.messageId,
				action: 'notspam'
			};
			api.updateMail(this, data).then(function(res) {
				this.st.alert.success('Got it.');
				this.houseKeeping(res.data);
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}
			});
		},
		houseKeeping: function(folderId) {
			var messageId = this.messageId
			var message = document.getElementsByClassName('mail-' + messageId)[0];

			if (typeof message !== 'undefined') { // We are in folder view
				this.st.mails = this.st.mails.filter(function(e) {
					return e.messageId !== messageId; // remove by value
				})
				if (this.st.mails.length === 0) { // We just removed the last one!
					this.$parent.noMailsLeft = true;
				}
			}else{ // We are in mail view
				this.$route.router.go({ name: 'folder', params: { accountId: this.$route.params.accountId, folderId: folderId } })
			}
		}
	}
}
</script>
