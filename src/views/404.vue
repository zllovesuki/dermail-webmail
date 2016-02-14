<template>
	<div>
		<div class="mt2 mb2">
			<div class="bg-white rounded mb4">
				<div class="overflow-hidden bg-white rounded">
					<div class="m1 p2">
						404
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>

var st = require('../lib/st.js');
var api = require('../lib/api.js');

module.exports = {
	data: function() {
		return {
			st: st
		}
	},
	computed: {
	},
	ready: function() {
	},
	beforeCompile: function() {
		this.st.setTitle('404');
	}
}
</script>
