<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2" v-if="st.mails.length === 0 || noMailsLeft">
			<div class="m0 p2">
				<span class="p2 bold h5 m0 black">
					No mails in this folder
				</span>
			</div>
		</div>
		<mail-item v-for="mail in st.mails" :mail.sync="mail"></mail-item>
		<p class="center" v-if="st.mails.length > 0 && !noMailsLeft">
			<button class="h5 btn btn-outline {{ st.color }}" @click="loadMore" :disabled="disableLoadMore">
				Load {{ slice.perPage }} More
			</button>
		</p>
	</div>
</template>
<script>

var st = require('../../lib/st.js');
var api = require('../../lib/api.js');

module.exports = {
	data: function() {
		return {
			st: st,
			folderModal: false,
			noMailsLeft: false,
			disableLoadMore: false,
			slice: {
				perPage: 10,
				date: null,
				starOnly: st.starOnly
			}
		}
	},
	created: function() {
		this.st.mails = [];
	},
	compiled: function() {

		var that = this;

		this.st.loading.go(50);

		api.grabDependencies(2, this)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			that.st.setTitle(that.st.folder.displayName);
			if (that.st._folders.length === 0) {
				that.$dispatch('getFoldersInAccount', function() {
					that.loadMore();
				});
			}else{
				that.loadMore();
			}
		})
	},
	events: {
		'reloadFolder': function(msg) {
			this.st.mails = [];
			this.disableLoadMore = false;
			this.slice = {
				perPage: 10,
				date: null,
				starOnly: st.starOnly
			}
			this.loadMore();
		}
	},
	methods: {
		More: function() {
			var lastMail = this.st.mails.slice(-1)[0];
			if (lastMail) {
				this.slice.date = lastMail.date;
			}
		},
		loadMore: function() {
			this.st.loading.go(70);
			this.More();
			api.getMailsInFolder(this, {
				slice: this.slice
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.st.mails = this.st.mails.concat(res.data);
				if (this.st.mails.length < this.slice.perPage || res.data.length < this.slice.perPage) {
					this.disableLoadMore = true;
				}
			})
			.finally(function() {
				this.st.loading.go(100);
			});
		}
	}
}
</script>
