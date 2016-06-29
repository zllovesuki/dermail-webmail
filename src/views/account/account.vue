<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2" v-show="st.folders.length === 0">
			<div class="m0 p2">
				<span class="p2 bold h5 m0 black">
					Loading folders for this account...
				</span>
			</div>
		</div>
		<div class="overflow-hidden bg-white rounded mb2 clearfix" v-if="st.folders.length > 0">
			<folder-item v-for="folder in st.folders" :folder="folder" :index="$index" keep-alive></folder-item>
		</div>
		<div class="mt2 mb2">
			<div class="overflow-hidden bg-white rounded mb2">
				<div class="m0 p1">
					<div class="clearfix">
						<span class="btn black h5 muted ">Manage: </span>
					</div>
					<!--<div class="clearfix">
						<span class="ml1 btn black h6 muted not-clickable"></span>
					</div>-->
				</div>
				<div class="m0 p2 border-top">
					<div class="clearfix">
						<a class="muted h6 ml1 bold btn btn-outline {{ st.color }}" v-link="{ name: 'filter', params: { accountId: $route.params.accountId } }">Filters</a>
					</div>
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
	created: function() {
		this.st.folder = {};
		this.st.folders = [];
		this.st._folders = [];
	},
	compiled: function() {

		this.st.loading.go(50);

		this.st.setTitle('Folders');

		api.grabDependencies(1, this)
		.then(function(data) {
			this.st.loading.go(70);
			this.$dispatch('getFoldersInAccount', function() {
				this.st.loading.go(100);
			}.bind(this))
		}.bind(this))
	}
}
</script>
