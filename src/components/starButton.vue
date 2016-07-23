<template>
	<span>
		<a class="btn h4" @click="flipStar">
			{{ isStar === true ? '&#9733;': '&#9734;' }}
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
		messageId: {
			type: String,
			required: true
		},
		isStar: {
			type: Boolean,
			required: true
		}
	},
	methods: {
		flipStar: function(e) {
			var messageId = this.messageId;
			var currentStar = this.isStar;
			var newStar = (currentStar ? 'unstar' : 'star');
			this.updateMail({
				accountId: this.route.params.accountId,
				messageId: messageId,
				action: newStar
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.isStar = (newStar === 'star' ? true : false);
				var star = (this.isStar ? '&#9733;' : '&#9734;')
				this.setStarInMailArray(messageId, this.isStar);
				this.alert().success(star + ' : 👍');
			})
		}
	}
}
</script>
