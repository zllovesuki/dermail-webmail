<template>
	<div>
		<div class="ml1 mt1 mb1">
			<span class="btn button-narrow mxn2 muted" v-link="{ name: 'accounts' }">A</span>
			<chevron-right></chevron-right>
			<span v-if="isInSecurity">
				<span class="btn button-narrow mxn1" v-link="{ name: 'security' }">
					Security
				</span>
			</span>
			<span v-if="$route.params.accountId">
				<span class="btn button-narrow mxn1" v-link="{ name: 'account', params: { accountId: $route.params.accountId } }">
					{{ st.account.displayName }}
				</span>
				<span v-if="isInCompose">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'compose', params: { accountId: $route.params.accountId } }">
						Compose
					</span>
				</span>
				<span v-if="isInFilter">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'filter', params: { accountId: $route.params.accountId } }">
						Filter
					</span>
				</span>
				<span v-if="$route.params.folderId">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" v-link="{ name: 'folder', params: { accountId: $route.params.accountId, folderId: $route.params.folderId } }">
						{{ st.folder.displayName }}
					</span>
				</span>
				<span v-if="isInFolder && st.folder.displayName">
					<chevron-right></chevron-right>
					<span class="btn button-narrow mxn1" @click="flipStarOnly">
						{{ st.starOnly === true ? '&#9733;': '&#9734;' }}
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
		},
		isInFolder: function() {
			return this.$route.name === 'folder'
		},
		isInSecurity: function() {
			return this.$route.name === 'security'
		}
	},
	methods: {
		listToTree: function(data, options) {
			options = options || {};
		    var ID_KEY = options.idKey || 'id';
		    var PARENT_KEY = options.parentKey || 'parent';
		    var CHILDREN_KEY = options.childrenKey || 'children';

		    var tree = [],
		        childrenOf = {};
		    var item, id, parentId;

		    for (var i = 0, length = data.length; i < length; i++) {
		        item = data[i];
		        id = item[ID_KEY];
		        parentId = item[PARENT_KEY] || 0;
		        // every item may have children
		        childrenOf[id] = childrenOf[id] || [];
		        // init its children
		        item[CHILDREN_KEY] = childrenOf[id];
		        if (parentId != 0) {
		            // init its parent's children object
		            childrenOf[parentId] = childrenOf[parentId] || [];
		            // push it into its parent's children object
		            childrenOf[parentId].push(item);
		        } else {
		            tree.push(item);
		        }
		    };

		    return tree;
		},
		flipStarOnly: function(e) {
			this.st.starOnly = !this.st.starOnly;
			this.$broadcast('reloadFolder');
		}
	},
	events: {
		'getFoldersInAccount': function(cb) {
			this.st.loading.go(50);
			api.getFoldersInAccount(this)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.st.putFoldersTree(this.listToTree(res.data, {
					idKey: 'folderId',
					parentKey: 'parent',
					childrenKey: 'child'
				}))
				this.st.putFoldersFlat(res.data);
			}.bind(this))
			.finally(function() {
				if (cb) cb();
			})
		},
		'setStarInMailArray': function(messageId, star, cb) {
			var mail = this.st.mails.filter(function(mail) {
				return mail.messageId === messageId;
			})
			if (mail.length === 1) {
				mail[0].isStar = star;
			}
		},
		'setReadInMailArray': function(messageId, read, cb) {
			var mail = this.st.mails.filter(function(mail) {
				return mail.messageId === messageId;
			})
			if (mail.length === 1) {
				mail[0].isRead = read;
			}
		}
	}
}
</script>
