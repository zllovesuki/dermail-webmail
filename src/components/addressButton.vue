<template>
	<span>
		<span class="btn mxn2 black h6 not-clickable">{{ originText }}: </span>
		<template v-for="address in origin">
			<a class="muted h6 bold btn mxn1 {{ color }}" @click="popup" data-name="{{address.name}}" data-email="{{address.address}}">{{ address | nameOrEmail | excerpt 20 }}</a>
		</template>
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
		originText: {
			type: String,
			required: true
		},
		origin: {
			type: Array,
			required: true
		}
	},
	methods: {
		popup: function(e) {
			var msg = '';
			var name = e.target.attributes['data-name'].value;
			var email = e.target.attributes['data-email'].value
			if (name.length > 1) {
				msg += '<span class="muted h5">' + name + '</span>';
			}
			if (email.length > 1) {
				msg += ' <span class="bold h5" style="word-wrap: break-word;">&lt;' + email + '></span>';
			}
			this.alert().alert(msg);
		}
	}
}
</script>
