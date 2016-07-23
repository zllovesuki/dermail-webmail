<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">Color Scheme: </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">You can change the color scheme of the interface.</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<select class="block col-3 mb2 field" :value="color" @change="dispatchColor">
						<option v-for="color in colors" value="{{ color }}">{{ color }}</option>
					</select>
					<button class="h6 btn btn-outline {{ color }} ml1 mb1" @click="doSaveColor">Save</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

var getters = require('../../lib/vuex/getters.js')
var actions = require('../../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
	methods: {
		dispatchColor: function(e) {
			this.setColor(e.target.value);
		},
		doSaveColor: function() {
			this.saveColor();
			this.alert().success('Color scheme saved!');
		},
	},
	beforeCompile: function() {
		this.setTitle('Color');
	},
	ready: function() {
		this.loading().go(100);
	}
}
</script>
