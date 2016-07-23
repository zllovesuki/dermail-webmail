<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2" v-if="mails.length === 0 || noMailsLeft">
			<div class="m0 p2">
				<span class="p2 bold h5 m0 black">
					No mails in this folder
				</span>
			</div>
		</div>
		<mail-item v-for="mail in mails" :prop-mail="mail"></mail-item>
		<p class="center" v-if="mails.length > 0 && !noMailsLeft">
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
			disableLoadMore: false,
			slice: {
				perPage: 10,
				date: null,
				starOnly: false
			},
			tmpMails: [],
			tmpModified: false
		}
	},
	created: function() {
		var currentFolderId = this.route.params.folderId;
		if (currentFolderId !== this.lastFolderId) {
			this.removeMails();
		}else{
			this.tmpMails = this.mails;
			this.tmpModified = true;
			this.removeMails();
		}
	},
	compiled: function() {

		this.loading().go(50);

		this.grabDependencies(2)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			this.setTitle(this.folder.displayName);
			if (this.flatFolders.length === 0) {
				this.getFoldersInAccount()
				.then(function() {
					this.loadMore();
				}.bind(this))
			}else{
				this.loadMore();
			}
			this.setLastFolderId();
		}.bind(this))
	},
	events: {
		'reloadFolder': function(msg) {
			this.st.mails = [];
			this.disableLoadMore = false;
			this.slice = {
				perPage: 10,
				date: null,
				starOnly: false
			}
			this.loadMore();
		}
	},
	methods: {
		More: function() {
			var lastMail = this.mails.slice(-1)[0];
			if (lastMail) {
				this.slice.date = lastMail.date;
			}
		},
		loadMore: function() {
			this.loading().go(70);
			if (this.tmpModified) {
				this.putMails(this.tmpMails);
				this.tmpMails = [];
				this.tmpModified = false;
				this.loading().go(100);
			}else{
				this.More();
				this.getMailsInFolder({
					slice: this.slice
				})
				.then(function(res) {
					if (typeof res === 'undefined') return;
					if (this.mails.length < this.slice.perPage || res.length < this.slice.perPage) {
						this.disableLoadMore = true;
					}
				})
				.finally(function() {
					this.loading().go(100);
				});
			}
		}
	}
}
</script>
