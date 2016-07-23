<template>
	<span>
		<div class="fixed top-0 right-0 m2" v-if="route.params && route.params.accountId">
			<a class="btn block" @click="showModal">
				<search-icon></search-icon>
			</a>
		</div>
		<modal :show.sync="search.modal">
			<h4 slot="header">Search in <u>{{ account.displayName }}</u></h4>
			<span slot="body">
					<input type="text" class="field block col-12 mb1 search-box" v-model="search.string" debounce="500">
					<ul class="list-reset block y-scrollable">
						<li class="overflow-hidden" v-for="result in search.results" track-by="messageId">
							<a target="_blank" v-link="{ name: 'mail', params: { accountId: this.route.params.accountId, folderId: result.folder.folderId, messageId: result.messageId }}" class="btn">
								{{result.folder.displayName}} - {{ result.subject }}
							</a>
						</li>
						<li v-if="search.string.length > 0 && search.results.length === 0">No results.</li>
					</ul>
			</span>
		</modal>
	</span>
</template>

<script>

var getters = require('../lib/vuex/getters.js')
var actions = require('../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
	data: function() {
		return {
			search: {
				modal: false,
				string: '',
				results: []
			}
		}
	},
	watch: {
		'search.string': function(val, oldVal) {
			if (val.length < 1) return;
			this.loading().go(30);
			this.searchMailsInAccount({
				accountId: this.$route.params.accountId,
				searchString: val
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var data = res.json();
				this.search.results = data;
			})
			.finally(function() {
				this.loading().go(100);
			})
		}
	},
	methods: {
		showModal: function() {
			this.search.modal = true;
			this.search.string = '';
			this.search.results = [];
			setTimeout(function() {
				document.getElementsByClassName('search-box')[0].focus();
			}, 500);
		}
	}
}
</script>

<style>
ul {
	max-height: 20em;
}
</style>
