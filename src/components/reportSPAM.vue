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

var getters = require('../lib/vuex/getters.js')
var actions = require('../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
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
	computed: {
		alreadySpam: function() {
			return this.folderName.toLowerCase() !== 'spam';
		}
	},
	methods: {
		moveToSPAM: function() {
			var data = {
				accountId: this.route.params.accountId,
				messageId: this.messageId,
				action: 'spam'
			};
			var currentFolder = this.folderId;
			this.updateMail(data)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.alert().success('I hate SPAM!');
				return this.mailHouseKeeping(currentFolder, this.messageId, true);
			})
		},
		notSPAM: function() {
			var data = {
				accountId: this.route.params.accountId,
				messageId: this.messageId,
				action: 'notspam'
			};
			this.updateMail(data)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var data = res.text();
				this.alert().success('Got it.');
				return this.mailHouseKeeping(data, this.messageId, true);
			})
		}
	}
}
</script>
