<template>
	<span v-show="!hide">
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
		context: {
			type: Object,
			required: true
		},
	},
	data: function() {
		return {
			hide: false
		}
	},
	computed: {
		alreadySpam: function() {
			return this.context.displayName.toLowerCase() !== 'spam';
		}
	},
	methods: {
		moveToSPAM: function() {
			var data = {
				accountId: this.context.accountId,
				messageId: this.context.messageId,
				action: 'spam'
			};
			var currentFolder = this.context.folderId;
			this.hide = true;
			this.updateMail(data)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.alert().success('I hate SPAM!');
				return this.mailHouseKeeping(currentFolder, this.context.messageId, true);
			}.bind(this))
			.finally(function() {
				this.hide = false;
			}.bind(this))
		},
		notSPAM: function() {
			var data = {
				accountId: this.context.accountId,
				messageId: this.context.messageId,
				action: 'notspam'
			};
			this.hide = true;
			this.updateMail(data)
			.then(function(res) {
				if (typeof res === 'undefined') return;
                return res.text();
            })
            .then(function(data) {
				this.alert().success('Got it.');
				return this.mailHouseKeeping(data, this.context.messageId, true);
			})
			.finally(function() {
				this.hide = false;
			}.bind(this))
		}
	}
}
</script>
