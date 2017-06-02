<template>
	<span>
		<a class="btn h4" @click="flipStar">
			{{ context.isStar === true ? '&#9733;': '&#9734;' }}
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
		}
	},
	methods: {
		flipStar: function(e) {
			var messageId = this.context.messageId;
			var currentStar = this.context.isStar;
			var newStar = (currentStar ? 'unstar' : 'star');
			this.updateMail({
				accountId: this.context.accountId,
				messageId: messageId,
				action: newStar
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var isStar = (newStar === 'star' ? true : false);
				var star = (isStar ? '&#9733;' : '&#9734;')
				this.setStarInMail(isStar);
				this.setStarInMailArray(messageId, isStar);
				this.alert().success(star + ' : 👍');
			})
		}
	}
}
</script>
