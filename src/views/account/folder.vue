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

		var that = this;
		this.st.mails = [];

		api.grabDependencies(2, this, function(data) {
			if (that.st._folders.length === 0) {
				that.$dispatch('getFoldersInAccount', function() {
					that.st.loading.go(100);
				});
			}
			that.st.setTitle(that.st.folder.displayName);
		});

		this.loadMore();
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
			this.More();
			api.getMailsInFolder(this, {
				slice: this.slice
			}).then(function(res) {
				this.st.mails = this.st.mails.concat(res.data);
				if (this.st.mails.length < this.slice.perPage || res.data.length < this.slice.perPage) {
					this.disableLoadMore = true;
					this.$nextTick(function() {
						this.st.alert.error('No more mails to load!');
					})
				}
				this.st.loading.go(100);
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}else{
					this.st.alert.error(res.statusText);
				}
				this.st.loading.go(100);
			});
		}
	}
}
</script>
