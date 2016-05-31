<template>
	<span>
		<span class="btn black h6 muted not-clickable">{{ originText }}: </span>
		<template v-for="address in origin">
			<a class="muted h6 bold btn mxn1 {{ st.color }}" @click="flipContent" title="{{address.account}}@{{address.domain}}">{{ address | nameOrEmail }}</a>
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
		flipContent: function(e) {
			var flip = e.target.title;
			var was = e.target.innerHTML;
			e.target.innerHTML = flip;
			e.target.setAttribute('title', was);
		}
	}
}
</script>
