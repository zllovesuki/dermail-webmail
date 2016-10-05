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
			<div class="m0 p0" v-if="accounts.length === 0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h5 not-clickable">
							No accounts found.
						</span>
					</div>
				</div>
			</div>
			<template v-for="account in accounts" track-by="accountId">
				<div class="m0 p0 border-top">
					<div class="clearfix">
						<div class="left black">
							<a v-link="{ name: 'account', params: { accountId: account.accountId } }" class="btn block h5">
								{{ account.account }} <span class="muted black">@{{ account.domain }}</span> <span class="muted {{color}}" v-if="account.notify">&nbsp;&#9834;</span>
							</a>
						</div>
						<div class="right">
							<a class="btn h6 muted" @click="popup" data-account="{{account.account}}" data-address="{{account.account}}@{{account.domain}}" data-alias="{{ account.alias.join(',') }}" v-show="account.alias.length > 0">
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
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ color }}" v-link="{ name: 'settingPushNotification' }">Notifications</a>
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ color }}" @click="alias.selectDomainModal = true">Alias</a>
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ color }}" @click="domain.selectDomainModal = true">Add a domain</a>
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ color }}" @click="account.selectDomainModal = true">Add an account</a>
					</div>
				</div>
			</div>
		</div>
		<modal :show.sync="alias.selectDomainModal">
			<h4 slot="header">Select a domain</h4>
			<span slot="body">
				<form v-on:submit.prevent="selectAliasDomain" class="h5">
					<label for="domain">For domain:</label>
					<select class="block col-12 mt2 mb2 field" v-model="alias.selectedDomain">
						<option v-for="domain in uniqueDomains" track-by="accountId" value="{{ domain.domainId }}">{{ domain.domain }}</option>
					</select>
					<hr />
					<span class="block mb1">Alias allows you to receive mails from multiple domain names under one account.</span>
					<button type="submit" class="btn btn-primary mb1" :disabled="!hasSelectedAliasDomain">View</button>
				</form>
			</span>
		</modal>
		<modal :show.sync="alias.editModal">
			<h4 slot="header">Modify aliases</h4>
			<span slot="body">
				<form v-on:submit.prevent="editDomainAlias" class="h5">
					<label for="alias">Alias (one per line):</label>
					<textarea class="block field col-12 mt2 mb1" style="resize: none; line-height: 1em; min-height: 6em;" v-model="aliasList"></textarea>
					<hr />
					<span class="block mb1">Make sure that you <i>didn't</i> remove an alias by accident.</span>
					<button type="submit" class="btn btn-primary" :disabled="alias.modifyButtonDisabled">Modify</button>
					<button type="button" class="btn btn-primary black bg-gray ml1" @click="toggleAliasViewAndModify">Go back</button>
				</form>
			</span>
		</modal>
        <modal :show.sync="account.selectDomainModal">
			<h4 slot="header">Add a new account</h4>
			<span slot="body">
				<form v-on:submit.prevent="addAccount" class="h5">
                    <label for="account" class="mt2 block">
                        <input type="text" class="col-4 mb2 field inline-block" v-model="account.account">
                        @
    					<select class="col-6 mb2 field inline-block" v-model="account.selectedDomain">
    						<option v-for="domain in uniqueDomains" track-by="accountId" value="{{ domain.domainId }}">{{ domain.domain }}</option>
    					</select>
                    </label>
					<button type="submit" class="btn btn-primary mb1" :disabled="!hasSelectedAccountDomain">Add</button>
				</form>
			</span>
		</modal>
        <modal :show.sync="domain.selectDomainModal">
			<h4 slot="header">Add a new domain</h4>
			<span slot="body">
				<form v-on:submit.prevent="addDomain" class="h5">
                    <label for="account" class="mt2 block">
                        <input type="text" class="col-4 mb2 field inline-block" v-model="domain.account" placeholder="inbox">
                        @
    					<input type="text" class="col-6 mb2 field inline-block" v-model="domain.domain" placeholder="example.com">
                    </label>
                    <hr />
					<span class="block mb1">It is logically to also add your first account for the domain.</span>
					<button type="submit" class="btn btn-primary mb1" :disabled="!hasEnteredNewDomain">Add</button>
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
			alias: {
				modifyButtonDisabled: false,
				selectDomainModal: false,
				selectedDomain: null,
				editModal: false,
				byDomainId: []
			},
            account: {
				selectDomainModal: false,
				selectedDomain: null,
				account: ''
            },
            domain: {
				selectDomainModal: false,
				domain: '',
				account: ''
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
		hasSelectedAliasDomain: function() {
			return !!this.alias.selectedDomain;
		},
		hasSelectedAccountDomain: function() {
			return !!this.account.selectedDomain && this.account.account.length > 0;
		},
        hasEnteredNewDomain: function () {
            return this.domain.account.length > 0 && this.domain.domain.length > 0;
        },
        uniqueDomains: function() {
            var array = [];
            var dup = {};
            for (var i = 0, accounts = this.accounts, length = accounts.length; i < length; i++) {
                if (dup[accounts[i].domain] !== true) {
                    dup[accounts[i].domain] = true;
                    array.push(accounts[i])
                }
            }
            return array;
        }
	},
	methods: {
		popup: function(e) {
			var msg = '';
			var account = e.target.attributes['data-account'].value;
            var address = e.target.attributes['data-address'].value;
			var alias = e.target.attributes['data-alias'].value;
            var array = [];
            msg += '<p class="h4 muted">' + address + ':</p>';
            alias.split(',').forEach(function(singleAlias) {
                array.push(account + '@' + singleAlias);
            });

            msg += '<span class="h5 bold">' + array.join(', ') + '</span>';
			this.alert().alert(msg);
		},
		selectAliasDomain: function() {
			for (var i = 0; i < this.accounts.length; i++) {
				if (this.accounts[i].hasOwnProperty('domainId') && this.accounts[i].domainId === this.alias.selectedDomain) {
					this.alias.byDomainId = this.accounts[i].alias;
				}
			}
			this.toggleAliasViewAndModify();
		},
		toggleAliasViewAndModify: function() {
			this.alias.selectDomainModal = !this.alias.selectDomainModal
			this.alias.editModal = !this.alias.editModal;
		},
        addDomain: function() {
        this.loading().go(30);
            this.domain.selectDomainModal = !this.domain.selectDomainModal
			this.updateDomain({
				action: 'newDomain',
				domain: this.domain.domain
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
                return res.text();
            })
            .then(function(domainId) {
    			return this.updateAccount({
    				action: 'newAccount',
    				domainId: domainId,
    				account: this.domain.account
    			})
    			.then(function(res) {
    				if (typeof res === 'undefined') return;
                    return res.text();
                })
                .then(function(accountId) {
    				this.alert().success('New account added.');
                    return this.route.router.go({ name: 'account', params: { accountId: accountId } })
    			})
			})
			.finally(function() {
				return this.getAccounts()
				.then(function() {
					this.loading().go(100);
				}.bind(this))
			})
        },
        addAccount: function() {
			this.account.selectDomainModal = !this.account.selectDomainModal
            this.loading().go(30);
			this.updateAccount({
				action: 'newAccount',
				domainId: this.account.selectedDomain,
				account: this.account.account
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
                return res.text();
            })
            .then(function(accountId) {
				this.alert().success('New account added.');
                return this.route.router.go({ name: 'account', params: { accountId: accountId } })
			})
			.finally(function() {
				return this.getAccounts()
				.then(function() {
					this.loading().go(100);
				}.bind(this))
			})
		},
		editDomainAlias: function() {
			this.loading().go(30);
			this.alias.modifyButtonDisabled = true;
			this.updateDomain({
				action: 'updateAlias',
				domainId: this.alias.selectedDomain,
				alias: this.alias.byDomainId
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.alert().success('Domain updated.');
				this.resetAliasState();
			})
			.finally(function() {
				this.alias.modifyButtonDisabled = false;
				return this.getAccounts()
				.then(function() {
					this.loading().go(100);
				}.bind(this))
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
		this.removeFolder();
		this.removeAddressBook();
		this.removeAccount();
		this.resetLastFolderId();
	},
	ready: function() {

		this.loading().go(50);

		this.setTitle('Accounts');

		this.getAccounts()
		.finally(function() {
			this.loading().go(100);
		}.bind(this))

	}
}
</script>
