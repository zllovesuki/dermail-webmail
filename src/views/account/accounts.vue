<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h4 muted not-clickable">
							account@domain <span class="h6">&nbsp;&#9834;</span>
						</span>
					</div>
					<div class="right">
						<span class="btn h6">
							alias
						</span>
					</div>
				</div>
			</div>
			<div class="m0 p0" v-if="st.accounts.length === 0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h5 not-clickable">
							Loading account list...
						</span>
					</div>
				</div>
			</div>
			<template v-for="account in st.accounts">
				<div class="m0 p0 border-top">
					<div class="clearfix">
						<div class="left black">
							<a v-link="{ name: 'account', params: { accountId: account.accountId } }" class="btn block h5">
								{{ account.account }} <span class="muted black">@{{ account.domain }}</span> <span class="muted {{st.color}}" v-if="account.notify">&nbsp;&#9834;</span>
							</a>
						</div>
						<div class="right">
							<a class="btn h6 muted" @click="popup" data-account="{{account.account}}@{{account.domain}}" data-alias="{{ account.alias.join(', ') }}" v-show="account.alias.length > 0">
								show
							</a>
						</div>
					</div>
				</div>
			</template>
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
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" v-link="{ name: 'settingPushNotification' }">Notifications</a>
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" @click="alias.selectDomainModal = true">Alias</a>
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" >Add an account</a>
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" >Add a domain</a>
					</div>
				</div>
			</div>
		</div>
		<modal :show.sync="alias.selectDomainModal">
			<h4 slot="header">Select a domain</h4>
			<span slot="body">
				<form v-on:submit.prevent="selectDomain" class="h5">
					<label for="domain">For domain:</label>
					<select class="block col-12 mb2 field" v-model="alias.selectedDomain">
						<option v-for="account in st.accounts" value="{{ account.domainId }}">{{ account.domain }}</option>
					</select>
					<hr />
					<span class="block mb1">Alias allows you to receive mails from multiple domain names under one account.</span>
					<button type="submit" class="btn btn-primary mb1" :disabled="!hasSelectedDomain">View</button>
				</form>
			</span>
		</modal>
		<modal :show.sync="alias.editModal">
			<h4 slot="header">Modify aliases</h4>
			<span slot="body">
				<form v-on:submit.prevent="editDomainAlias" class="h5">
					<label for="alias">Alias (one per line):</label>
					<textarea class="block field col-12 mb1" style="resize: none; line-height: 1em; min-height: 6em;" v-model="aliasList"></textarea>
					<hr />
					<span class="block mb1">Make sure that you <i>didn't</i> remove an alias by accident.</span>
					<button type="submit" class="btn btn-primary" :disabled="alias.modifyButtonDisabled">Modify</button>
					<button type="button" class="btn btn-primary black bg-gray ml1" @click="toggleViewAndModify">Go back</button>
				</form>
			</span>
		</modal>
	</div>
</template>
<script>

var api = require('../../lib/api.js');
var st = require('../../lib/st.js');

module.exports = {
	data: function() {
		return {
			st: st,
			alias: {
				modifyButtonDisabled: false,
				selectDomainModal: false,
				selectedDomain: null,
				editModal: false,
				byDomainId: []
			}
		}
	},
	computed: {
		aliasList: {
			get: function() {
				return this.alias.byDomainId.join("\n");
			},
			set: function(val) {
				val = val.toLowerCase().split("\n");
				val = val || [];
				this.alias.byDomainId = val.filter(function(str) {
					return /\S/.test(str) && /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(str);
				});
			}
		},
		hasSelectedDomain: function() {
			return !!this.alias.selectedDomain;
		}
	},
	methods: {
		popup: function(e) {
			var msg = '';
			var account = e.target.attributes['data-account'].value;
			var alias = e.target.attributes['data-alias'].value;
			msg += '<p class="h4 muted">' + account + ':</p>';
			msg += '<span class="h5 bold">' + alias + '</span>';
			this.st.alert.alert(msg);
		},
		selectDomain: function() {
			for (var i = 0; i < this.st.accounts.length; i++) {
				if (this.st.accounts[i].hasOwnProperty('domainId') && this.st.accounts[i].domainId === this.alias.selectedDomain) {
					this.alias.byDomainId = this.st.accounts[i].alias;
				}
			}
			this.toggleViewAndModify();
		},
		toggleViewAndModify: function() {
			this.alias.selectDomainModal = !this.alias.selectDomainModal
			this.alias.editModal = !this.alias.editModal;
		},
		editDomainAlias: function() {
			this.st.loading.go(30);
			this.alias.modifyButtonDisabled = true;
			api.updateDomain(this, {
				action: 'updateAlias',
				domainId: this.alias.selectedDomain,
				alias: this.alias.byDomainId
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.st.alert.success('Domain updated.');
				this.resetAliasState();
			})
			.finally(function() {
				this.$dispatch('getAccounts', function() {
					this.st.loading.go(100);
				}.bind(this))
				this.alias.modifyButtonDisabled = false;
			})
		},
		resetAliasState: function() {
			this.alias = {
				modifyButtonDisabled: false,
				selectDomainModal: false,
				selectedDomain: null,
				editModal: false,
				byDomainId: []
			}
		}
	},
	created: function() {
		this.st.account = {};
		this.st.lastFolderId = null;
	},
	compiled: function() {

		this.st.loading.go(50);

		this.st.setTitle('Accounts');

		this.$dispatch('getAccounts', function() {
			this.st.loading.go(100);
		}.bind(this))

	}
}
</script>
