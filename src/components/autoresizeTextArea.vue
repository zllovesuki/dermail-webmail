<template>
	<div>
		<textarea class="block col-12 field border-none compose" placeholder="markdown..." v-model="st.compose.markdown" debounce="500"></textarea>
	</div>
</template>

<script>

var st = require('../lib/st.js');
var autosize = require('autosize');

module.exports = {
	data: function() {
		return {
			st: st
		}
	},
	ready: function() {
		var textarea = document.getElementsByClassName('compose')[0];
		autosize(textarea);
	}
}
</script>
