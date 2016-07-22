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

var getters = require('../lib/vuex/getters.js')
var actions = require('../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
	ready: function() {
		this.loading().go(100);
	},
	beforeCompile: function() {
		this.setTitle('404');
	}
}
</script>
