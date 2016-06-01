<template>
	<span>
		<a class="h6 btn black" @click="testSPAM">
			Spamc
		</a>
	</span>
</template>

<script>
var st = require('../lib/st.js');
var api = require('../lib/api.js');

module.exports = {
	props: {
		messageId: {
			type: String,
			required: true
		}
	},
	data: function() {
		return {
			st: st
		}
	},
	methods: {
		testSPAM: function() {
			var data = {
				accountId: this.$route.params.accountId,
				messageId: this.messageId,
				action: 'spamc'
			};
			api.updateMail(this, data)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.st.alert.success('Job queued.');
			})
		}
	}
}
</script>
