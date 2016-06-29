<template>
	<span>
		<a class="h6 mxn1 btn red" @click="moveToSPAM" v-if="alreadySpam">
			> Spam!
		</a>
		<a class="h6 mxn1 btn green" @click="notSPAM" v-if="!alreadySpam">
			> NOT Spam!
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
			api.updateMail(this, data)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.st.alert.success('I hate SPAM!');
				this.$dispatch('houseKeeping', currentFolder, this.messageId, true);
			})
		},
		notSPAM: function() {
			var data = {
				accountId: this.$route.params.accountId,
				messageId: this.messageId,
				action: 'notspam'
			};
			api.updateMail(this, data)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.st.alert.success('Got it.');
				this.$dispatch('houseKeeping', res.data, this.messageId, true);
			})
		}
	}
}
</script>
