<template>
	<span>
		<span class="btn mxn1 black h6 muted not-clickable">{{ originText }}: </span>
		<template v-for="address in origin">
			<a class="muted h6 bold btn mxn1 {{ st.color }}" @click="popup" data-name="{{address.friendlyName}}" data-email="{{address.account}}@{{address.domain}}">{{ address | nameOrEmail | excerpt 15 }}</a>
		</template>
	</span>
</template>

<script>

var st = require('../lib/st.js');

module.exports = {
	props: {
		originText: {
			type: String,
			required: true
		},
		origin: {
			type: Array,
			required: true
		}
	},
	data: function() {
		return {
			st: st
		}
	},
	methods: {
		popup: function(e) {
			var msg = '';
			var name = e.target.attributes['data-name'].value;
			var email = e.target.attributes['data-email'].value
			if (name.length > 1) {
				msg += '<span>' + name + '</span>';
			}
			if (email.length > 1) {
				msg += ' <span class="bold" style="word-wrap: break-word;">&lt;' + email + '></span>';
			}
			this.st.alert.alert(msg);
		}
	}
}
</script>
