<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2" v-if="mails.length === 0 || noMailsLeft || !ready">
			<div class="m0 p2">
				<span class="p2 bold h5 m0 black">
					No mails in this folder
				</span>
			</div>
		</div>
		<mail-item v-for="mail in mails" track-by="messageId" :prop-mail="mail" v-if="ready"></mail-item>
		<p class="center" v-if="!hideLoadMore && ready">
			<button class="h5 btn btn-outline {{ color }}" @click="loadMore" :disabled="disableLoadMore">
				Load {{ slice.perPage }} More
			</button>
		</p>
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
			folderModal: false,
			hideLoadMore: false,
			disableLoadMore: false,
			skipFetching: false,
			initialLoad: true,
			ready: false
		}
	},
	created: function() {
		var currentFolderId = this.route.params.folderId;
		if (currentFolderId !== this.lastFolderId) {
			this.removeMails();
		}else{
			this.skipFetching = true;
		}
		this.resetSlice();
	},
	compiled: function() {

		this.loading().go(50);

		return this.grabDependencies(2)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			this.setLastFolderId();
			this.setTitle(this.folder.displayName);
			if (this.flatFolders.length === 0) {
				return this.getFoldersInAccount()
				.then(function() {
					return this.loadMore();
				}.bind(this))
			}else{
				return this.loadMore();
			}
		}.bind(this))
	},
	events: {
		'reloadFolder': function(msg) {
			this.removeMails();
			this.disableLoadMore = false;
			this.loadMore();
		}
	},
	methods: {
		More: function() {
			var lastMail = this.mails.slice(-1)[0];
			if (lastMail) {
				this.updateSliceDate(lastMail.date);
			}
		},
		loadMore: function() {
			this.loading().go(70);
			if (this.skipFetching) {
				this.checkIfNeedToSetNoMailsLeftToFalse(this.mails);
				this.skipFetching = false;
				this.ready = true;
				this.loading().go(100);
			}else{
				this.More();
				return this.getMailsInFolder()
				.then(function(res) {
					if (typeof res === 'undefined') return;
					if (this.mails.length < this.slice.perPage || res.length < this.slice.perPage) {
						this.disableLoadMore = true;
					}
					if (this.initialLoad) {
						this.checkIfNeedToSetNoMailsLeftToFalse(this.mails);
						this.initialLoad = false;
					}
					if (res.length === 0 && this.hideLoadMore === false) this.hideLoadMore = true;
				}.bind(this))
				.finally(function() {
					this.ready = true;
					this.loading().go(100);
				}.bind(this));
			}
		}
	}
}
</script>
