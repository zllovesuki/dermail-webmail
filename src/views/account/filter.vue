<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h4 not-clickable muted">
							Criteria <span class="black"> - Actions</span>
						</span>
					</div>
				</div>
			</div>
			<div class="m0 p0" v-if="filters.length === 0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn muted h5 not-clickable">
							No filters defined.
						</span>
					</div>
				</div>
			</div>
			<template v-for="filter in filters" track-by="filterId">
				<filter-item :filter="filter"></filter-item>
			</template>
		</div>
		<div class="mt2 mb2">
			<div class="overflow-hidden bg-white rounded mb2">
				<div class="m0 p1">
					<div class="clearfix">
						<span class="btn black h5 muted ">Manage: </span>
					</div>
				</div>
				<div class="m0 p2 border-top">
					<div class="clearfix">
						<a class="muted h6 ml1 bold btn btn-outline {{ color }}" @click="addModal = true">Search with Filter</a>
					</div>
				</div>
			</div>
		</div>
		<modal :show.sync="addModal">
			<h4 slot="header">Search with Filter</h4>
			<span slot="body">
				<form v-on:submit.prevent="doSearchWithFilter" class="h5">
					<label for="from">From, supports wildcard: <i>(or)</i></label>
					<input type="text" class="field block col-12 mb1" v-model="pre.from">
					<label for="to">To: <i>(or)</i></label>
					<input type="text" class="field block col-12 mb1" v-model="pre.to">
					<label for="subject">Subject: <i>(and)</i></label>
					<input type="text" class="field block col-12 mb1" v-model="pre.subject">
					<label for="contain">Has words: <i>(and)</i></label>
					<input type="text" class="field block col-12 mb1" v-model="pre.contain">
					<label for="exclude">Does not have: <i>(and)</i></label>
					<input type="text" class="field block col-12 mb1" v-model="pre.exclude">
					<button :disabled="buttonDisabled" type="submit" class="block btn btn-primary">Search</button>
				</form>
			</span>
		</modal>
		<modal :show.sync="resultModal">
			<h4 slot="header">Search results with filter ({{ searchResults.length }})</u></h4>
			<span slot="body">
				<ul class="list-reset block y-scrollable">
					<li class="overflow-hidden" v-for="result in searchResults" track-by="messageId">
					<a target="_blank" v-link="{ name: 'mail', params: { accountId: this.route.params.accountId, folderId: result.folder.folderId, messageId: result.messageId }}" class="btn">
							<i>{{ result.folder.displayName }}</i> - {{ result.subject }}
						</a>
					</li>
					<li v-if="searchResults.length === 0">No results.</li>
				</ul>
				<button type="submit" @click="createFilter" class="inline-block btn btn-primary h5">Create filter</button>
				<button type="button" @click="goBackToCriteria" class="inline-block btn btn-primary black bg-gray h5">Go Back</button>
			</span>
		</modal>
		<modal :show.sync="actionModal">
			<h4 slot="header">Apply actions...</u></h4>
			<span slot="body">
				<form v-on:submit.prevent="doCreateFilter" class="h5">
					<label for="folder">Move to folder: </label>
					<select class="block col-12 mb2 field" v-model="post.folder">
						<option value="default">(Default: Inbox)</option>
						<option v-for="f in flatFolders" track-by="folderId" value="{{ f.folderId }}" v-if="f.displayName !== 'Inbox' && f.displayName !== 'Sent' ">{{ f.displayName }}</option>
					</select>
					<label for="notify" class="block col-12 mb2">Do no notify:  <input type="checkbox" v-model="post.doNotNotify"></label>
					<label for="read" class="block col-12 mb2">Mark read:  <input type="checkbox" v-model="post.markRead"></label>
					<hr />
					<label for="existing" class="block col-12 mb2">Apply to existing emails: </label>
					<label for="folder" class="block col-12 mb2">Move to folder:  <input type="checkbox" v-model="existing.folder"></label>
					<label for="read" class="block col-12 mb2">Mark Read:  <input type="checkbox" v-model="existing.markRead"></label>
					<button :disabled="buttonDisabled" type="submit" class="mt2 inline-block btn btn-primary">Create</button>
					<button type="button" @click="goBackToResults" class="mt2 inline-block btn btn-primary black bg-gray h5">Go Back</button>
				</form>
			</span>
		</modal>
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
			buttonDisabled: false,
			addModal: false,
			resultModal: false,
			actionModal: false,
			searchResults: [],
			pre: {
				from: null,
				to: null,
				subject: null,
				contain: null,
				exclude: null
			},
			post: {
				doNotNotify: false,
				markRead: true,
				folder: 'default'
			},
			existing: {
				markRead: false,
				folder: false
			}
		}
	},
	methods: {
		doSearchWithFilter: function() {
			var count = 0;
			Object.keys(this.pre).forEach(function(key) {
				if (!!this.pre[key]) count++;
			}.bind(this))
			if (count === 0) {
				return this.alert().error('At least one criteria is required.');
			}
			this.buttonDisabled = true;
			this.loading().go(30);
			this.searchWithFilter({
				accountId: this.$route.params.accountId,
				criteria: this.pre
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var data = res.json();
				this.searchResults = data;
				this.addModal = false;
				this.resultModal = true;
			})
			.finally(function() {
				this.loading().go(100);
				this.buttonDisabled = false;
			})
		},
		goBackToCriteria: function() {
			this.resultModal = false;
			this.addModal = true;
		},
		goBackToResults: function() {
			this.actionModal = false;
			this.addModal = true;
		},
		createFilter: function() {
			this.resultModal = false;
			this.actionModal = true;
		},
		doCreateFilter: function() {
			this.loading().go(30);
			this.buttonDisabled = true;
			this.modifyFilter({
				accountId: this.$route.params.accountId,
				op: 'add',
				criteria: this.pre,
				action: this.post,
				existing: this.existing
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.actionModal = false;
				// Force a refresh in case that filter changes anything
				this.refreshFolderView();
				this.resetLastFolderId();
				this.alert().success('Filter created.');
			})
			.finally(function() {
				return this.getFilters()
				.then(function() {
					this.loading().go(100);
				})
				this.buttonDisabled = false;
			})
		}
	},
	created: function() {
		this.removeFilters();
	},
	compiled: function() {

		this.setTitle('Filter');

		this.grabDependencies(1)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			return this.getFoldersInAccount()
			.then(function() {
				return this.getFilters()
			})
			.then(function() {
				this.loading().go(100);
			}.bind(this))
		}.bind(this))

	}
}
</script>
