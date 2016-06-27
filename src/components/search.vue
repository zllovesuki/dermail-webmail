<template>
	<span>
		<div class="fixed top-0 right-0 m2" v-if="$route.params && $route.params.accountId">
			<a class="btn block" @click="showModal">
				<search-icon></search-icon>
			</a>
		</div>
		<modal :show.sync="search.modal">
			<h4 slot="header">Search in <u>{{ st.account.displayName }}</u></h4>
			<span slot="body">
					<input type="text" class="field block col-12 mb1 search-box" v-model="search.string" debounce="500">
					<ul class="list-reset block y-scrollable">
						<li class="overflow-hidden" v-for="result in search.results">
							<a @click="search.modal = false" v-link="{ name: 'mail', params: { accountId: this.$route.params.accountId, folderId: result.folder.folderId, messageId: result.messageId }}" class="btn">
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

var st = require('../lib/st.js');
var api = require('../lib/api.js');

module.exports = {
	data: function() {
		return {
			st: st,
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
			this.st.loading.go(30);
			api.searchMailsInAccount(this, {
				accountId: this.$route.params.accountId,
				searchString: val
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.search.results = res.data;
			})
			.finally(function() {
				this.st.loading.go(100);
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
