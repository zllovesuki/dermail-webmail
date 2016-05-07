<template>
	<div>
		<div class="mt1 mb1">
			<span class="btn button-narrow mxn1" v-link="{ name: 'accounts' }">Accounts</span>
			<chevron-right></chevron-right>
			<span v-if="$route.params.accountId">
				<span class="btn button-narrow mxn1" v-link="{ name: 'account', params: { accountId: this.$route.params.accountId } }">
					{{ st.account.displayName }}
				</span>
				<span v-if="isInCompose">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'compose', params: { accountId: this.$route.params.accountId } }">
						Compose
					</span>
				</span>
				<span v-if="isInFilter">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'filter', params: { accountId: this.$route.params.accountId } }">
						Filter
					</span>
				</span>
				<span v-if="$route.params.folderId">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'folder', params: { accountId: this.$route.params.accountId, folderId: this.$route.params.folderId } }">
						{{ st.folder.displayName }}
					</span>
				</span>
			</span>
		</div>
		<div class="mt2 mb1">
			<router-view transition="fade"></router-view>
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
	computed: {
		isInCompose: function() {
			return this.$route.name === 'compose'
		},
		isInFilter: function() {
			return this.$route.name === 'filter'
		}
	},
	methods: {
		buildTree: function(list) {
			var idAttr = 'folderId';
			var parentAttr = 'parent';
			var childrenAttr = 'child';

			var root = [];
			var lookup = {};

			list.forEach(function(obj) {
				lookup[obj[idAttr]] = obj;
				obj[childrenAttr] = [];
			});
			list.forEach(function(obj) {
				if (obj[parentAttr] != null) {
					lookup[obj[parentAttr]][childrenAttr].push(obj);
				}else{
					root.push(obj);
				}
			});
			return root;
		}
	},
	events: {
		'getFoldersInAccount': function(cb) {
			this.st.loading.go(50);
			api.getFoldersInAccount(this).then(function(res) {
				this.st.putFoldersTree(this.buildTree(res.data));
				this.st.putFoldersFlat(res.data);
				if (cb) cb();
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}else{
					this.st.alert.error(res.statusText);
				}
				if (cb) cb();
			});
		},
		'getAccounts': function(cb) {
			this.st.loading.go(50);
			api.getAccounts(this).then(function(res) {
				this.st.putAccounts(res.data);
				if (cb) cb();
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}else{
					this.st.alert.error(res.statusText);
				}
				if (cb) cb();
			});
		}
	}
}
</script>
