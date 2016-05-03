<template>
	<span>
		<a class="btn h3" @click="flipStar">
			{{ isStar === true ? '&#9733;': '&#9734;' }}
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
		},
		isStar: {
			type: Boolean,
			required: true,
			twoWay: true
		}
	},
	data: function() {
		return {
			st: st
		}
	},
	methods: {
		flipStar: function(e) {
			var messageId = this.messageId;
			var currentStar = this.isStar;
			var newStar = (currentStar ? 'unstar' : 'star');
			this.isStar = (newStar === 'star' ? true : false);
			api.updateMail(this, {
				accountId: this.$route.params.accountId,
				messageId: messageId,
				action: newStar
			}).then(function(res) {
				var star = (newStar === 'star' ? '&#9733;' : '&#9734;')
				e.target.innerHTML = star;
				this.st.alert.success('Updated to: ' + star);
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}else{
					this.st.alert.error(res.statusText);
				}
			});
		}
	}
}
</script>
