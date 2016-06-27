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
					<select class="block col-3 mb2 field" v-model="st.color">
						<option v-for="color in st.colors" value="{{ color }}">{{ color }}</option>
					</select>
					<button class="h6 btn btn-outline {{ st.color }} ml1 mb1" @click="saveColor">Save</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

var st = require('../../lib/st.js');
var api = require('../../lib/api.js');

module.exports = {
	data: function() {
		return {
			st: st
		}
	},
	methods: {
		saveColor: function() {
			//this.st.setBarColor(this.st.color);
			localStorage.setItem('color', this.st.color);
			this.st.alert.success('Color scheme saved!');
		},
	},
	beforeCompile: function() {
		this.st.setTitle('Color');
	},
	ready: function() {
		this.st.loading.go(100);
	}
}
</script>
