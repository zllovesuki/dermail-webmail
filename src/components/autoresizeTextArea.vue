<template>
	<div>
		<textarea class="block col-12 field border-none compose" placeholder="markdown..." :value="compose.markdown" @input="updateComposeMarkdown | debounce 500"></textarea>
	</div>
</template>

<script>

var autosize = require('autosize');
var getters = require('../lib/vuex/getters.js')
var actions = require('../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
	ready: function() {
		var textarea = document.getElementsByClassName('compose')[0];
		autosize(textarea);
	}
}
</script>
