<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2" v-if="folders.length === 0 || !ready">
			<div class="m0 p2">
				<span class="p2 bold h5 m0 black">
					Loading folders for this account...
				</span>
			</div>
		</div>
		<div class="overflow-hidden bg-white rounded mb2 clearfix" v-if="folders.length > 0 && ready">
			<folder-item v-for="folder in folders" track-by="folderId" :prop-folder="folder" :loading-unread.sync="loadingUnread" :index="$index" keep-alive></folder-item>
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
						<a class="muted h6 ml1 bold btn btn-outline {{ color }}" v-link="{ name: 'filter', params: { accountId: $route.params.accountId } }">Filters</a>
						<a class="muted h6 ml1 bold btn btn-outline {{ color }}" v-link="{ name: 'addresses', params: { accountId: $route.params.accountId } }">Address Book</a>
					</div>
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
	data: function() {
		return {
			skipFetching: false,
			initialLoad: true,
			ready: false,
            loadingUnread: true
		}
	},
	created: function() {
		var currentAccountId = this.route.params.accountId;
		if (currentAccountId !== this.lastAccountId) {
			this.removeFlatFolders();
			this.removeFolderTree();
		}else{
			this.skipFetching = true;
		}
		this.removeFolder();
		this.removeAddressBook();
        this.initUnreadCount();
	},
	ready: function() {

		this.loading().go(50);

		this.setTitle('Folders');

		this.grabDependencies(1)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			this.setLastAccountId();
			this.loading().go(70);
			if (!this.skipFetching) {
				return this.getFoldersInAccount();
			}else{
				this.skipFetching = false;
			}
		}.bind(this))
        .then(function() {
            this.ready = true;
            this.loading().go(90);
            return this.getUnread()
            .then(function() {
                this.loadingUnread = false;
            })
        }.bind(this))
		.finally(function() {
			this.loading().go(100);
		}.bind(this))
	}
}
</script>
