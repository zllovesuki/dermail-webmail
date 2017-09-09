<template>
	<div>
        <div class="overflow-hidden bg-white rounded mb2" v-if="showRetrain">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">Retrain filter: </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 not-clickable">
						<span class="muted">You should periodically retrain the filter with new mails.
					</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
                <div class="clearfix">
					<span class="btn black h5">Untrained Mails: </span>
				</div>
				<div class="clearfix">
					<table class="h6 col col-12">
						<template v-for="account in accounts" track-by="accountId" v-if="account.bayesEnabled === true">
							<tr>
								<td class="col col-6">
									<span class="btn left">{{ account.account }}@{{ account.domain }}</span>
								</td>
                                <td class="col col-6">
									<button v-if="account.trainLock !== false" type="button" class="right bold btn non-clickable btn-outline red muted">Busy</span>
                                    <button v-if="account.trainLock === false && account.untrainMailsCount > 0" type="button" class="right bold btn btn-outline {{ color }}" @click="popupRetrainModal(account.accountId)">{{ account.untrainMailsCount }} mails</span>
								</td>
							</tr>
						</template>
					</table>
				</div>
			</div>
		</div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">Per account setting: </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 not-clickable">
						<span class="muted">You can disable filtering for a particular account.</span> Disbaling filtering for an account will also remove learned knowledge of that account.
					</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<span class="btn black h5">Account Status: </span>
				</div>
				<div class="clearfix">
					<table class="h6 col col-12">
						<template v-for="account in accounts" track-by="accountId">
							<tr>
								<td class="col col-6">
									<span class="btn not-clickable left">{{ account.account }}@{{ account.domain }}</span>
								</td>
								<td class="col col-6">
									<button v-if="account.bayesEnabled === true" type="button" class="right bold btn btn-outline {{ color }}" @click="popupDisableBayes(account.accountId)">Enabled</span>
                                    <button v-if="account.bayesEnabled === false" type="button" class="right bold btn btn-outline {{ color }}" @click="popupEnableBayes(account.accountId)">Disabled</span>
								</td>
							</tr>
						</template>
					</table>
				</div>
			</div>
		</div>
        <modal :show.sync="retrainModal">
			<h4 slot="header">Retrain Bayesian Filter</h4>
			<span slot="body">
				<span class="block mb2 h5">Retraining will let the Bayesian filter learns new mails.</span>
				<button type="button" class="btn btn-primary h5" :disabled="disableRetrainButton" @click="enableBayes">Retrain</button>
			</span>
		</modal>
		<modal :show.sync="enableBayesModal">
			<h4 slot="header">Enabling Bayesian Filter</h4>
			<span slot="body">
				<span class="block mb2 h5">Currently Dermail will <b>not</b> filter emails on this account with Bayesian filter.</span>
				<button type="button" class="btn btn-primary h5" :disabled="disableBayesButton" @click="enableBayes">Enable</button>
			</span>
		</modal>
		<modal :show.sync="disableBayesModal">
			<h4 slot="header">Disabling Bayesian Filter</h4>
			<span slot="body">
				<span class="block mb2 h5">You can disable filter for this account. <b>This will remove previously learned rules.</b></span>
				<button type="button" class="btn btn-primary h5" :disabled="disableBayesButton" @click="disableBayes">Disable</button>
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
            retrainModal: false,
			enableBayesModal: false,
			disableBayesModal: false,
			disableBayesButton: false,
			accountId: [],
            showRetrain: false
		}
	},
	methods: {
		fetchAccounts: function() {
			this.getAccounts()
			.then(function() {
				this.loading().go(100);
                if (this.accounts.reduce(function(a, b) {
                    if (b.bayesEnabled === true) a++
                    return a;
                }, 0) > 0) this.showRetrain = true;
                else this.showRetrain = false;
			}.bind(this))
		},
        popupRetrainModal: function(accountId) {
			this.accountId = accountId;
			this.retrainModal = true;
		},
		popupEnableBayes: function(accountId) {
			this.accountId = accountId;
			this.enableBayesModal = true;
		},
		popupDisableBayes: function(accountId) {
			this.accountId = accountId;
			this.disableBayesModal = true;
		},
		disableBayes: function() {
            this.loading().go(30);
            this.disableBayesButton = true;
            return this.updateAccount({
                action: 'disableBayes',
                accountId: this.accountId
            })
            .then(function(res) {
                if (typeof res === 'undefined') return;
                this.disableBayesModal = false;
                this.alert().success('Bayesian filter disabled.');
            })
            .finally(function() {
                this.disableBayesButton = false;
                this.disableBayesModal = false;
                this.fetchAccounts();
            })
		},
		enableBayes: function() {
			this.loading().go(30);
			this.disableBayesButton = true;
			return this.updateAccount({
				action: 'enableBayes',
				accountId: this.accountId
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.enableBayesModal = false;
                this.retrainModal = false;
				this.alert().success('Modification to Bayesian filter requested.');
			})
			.finally(function() {
				this.disableBayesButton = false;
                this.enableBayesModal = false;
				this.fetchAccounts();
			})
		}
	},
	beforeCompile: function() {
		this.setTitle('Bayesian Filter');
	},
    ready: function() {
        this.fetchAccounts()
    }
}
</script>
