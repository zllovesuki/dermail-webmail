<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">Sender Policy Framework (SPF): </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">
						The purpose of an SPF record is to prevent spammers from sending messages with forged From addresses at your domain. Recipients can refer to the SPF record to determine whether a message purporting to be from your domain comes from an authorized mail server.
					</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<button type="button" class="h6 btn btn-outline {{ color }} ml1 mb1" @click="spfSetupModal = true">
						How to setup?
					</button>
					<button type="button" class="h6 btn btn-outline {{ color }} ml1 mb1" @click="spfCIDModal = true">
						Can I disable it?
					</button>
				</div>
			</div>
		</div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5">DomainKeys Identified Mail (DKIM): </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">
						DomainKeys Identified Mail (DKIM) defines a domain-level authentication framework for email using public-key cryptography and key server technology to permit verification of the source and contents of messages by either Mail Transfer Agents (MTAs) or Mail User Agents (MUAs). The ultimate goal of this framework is to permit a signing domain to assert responsibility for a message, thus protecting message signer identity and the integrity of the messages they convey while retaining the functionality of Internet email as it is known today. Protection of email identity may assist in the global control of "spam" and "phishing".
					</span>
				</div>
			</div>
			<div class="m0 p1 border-top">
				<div class="clearfix">
					<span class="btn black h5">Domain Status: </span>
				</div>
				<div class="clearfix">
					<table class="h6 col col-12">
						<template v-for="domain in securityCtx.dkim" track-by="domainId">
							<tr>
								<td class="col col-6">
									<span class="btn not-clickable left">{{ domain.domain }}</span>
								</td>
								<td class="col col-6">
									<button v-if="domain.dkim === false" type="button" class="right bold btn btn-outline {{ color }}" :disabled="!domain.isAdmin" @click="popupEnableDKIM(domain.domainId)">Disabled</span>
									<button v-if="typeof domain.dkim === 'object'" type="button" class="right bold btn btn-outline {{ color }}" :disabled="!domain.isAdmin"  @click="popupSetupDKIM(domain.domainId)">Enabled</span>
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
					<span class="btn black h5">Domain-based Message Authentication, Reporting and Conformance (DMARC): </span>
				</div>
				<div class="clearfix">
					<span class="ml1 btn black h6 muted not-clickable">
						DMARC is a proposed standard that allows email senders and receivers to cooperate in sharing information about the email they send to each other. This information helps senders improve the mail authentication infrastructure so that all their mail can be authenticated. It also gives the legitimate owner of an Internet domain a way to request that illegitimate messages – spoofed spam, phishing – be put directly in the spam folder or rejected outright.
					</span>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div class="clearfix">
					<button type="button" class="h6 btn btn-outline red ml1 mb1" @click="dmarcAttentionModal = true">
						Attentions
					</button>
					<button type="button" class="h6 btn btn-outline {{ color }} ml1 mb1" @click="dmarcSetupModal = true">
						How to setup?
					</button>
					<button type="button" class="h6 btn btn-outline {{ color }} ml1 mb1" @click="dmarcCIDModal = true">
						Can I disable it?
					</button>
				</div>
			</div>
		</div>
		<modal :show.sync="spfSetupModal">
			<h4 slot="header">Adding SPF Record</h4>
			<span slot="body">
				<span class="block mb1 h5">Please add the following TXT record to the main domain (aliases is not yet supported):</span>
				<span class="block mb1"><i>v=spf1 include:{{ securityCtx.spf }} -all</i></span>
			</span>
		</modal>
		<modal :show.sync="spfCIDModal">
			<h4 slot="header">Disable SPF Record</h4>
			<span slot="body">
				<span class="block mb1 h5">You <i>can</i> remove your SPF record from your DNS, but the recipient will not be able to verify the authenticity of the email origin.</span>
			</span>
		</modal>
		<modal :show.sync="enableDKIMModal">
			<h4 slot="header">Enabling DKIM</h4>
			<span slot="body">
				<span class="block mb2 h5">You don't have a private key/public key pair yet.</span>
				<button type="button" class="btn btn-primary h5" :disabled="disableGenerateButton" @click="generateKeyPair">Generate</button>
			</span>
		</modal>
		<modal :show.sync="setupDKIMModal">
			<h4 slot="header">Setting Up DKIM</h4>
			<span slot="body" v-if="domain.dkim">
				<span class="block mb1 h5">Add a <b>TXT</b> record for:</span>
				<div class="p1 bg-darken-1 mb1" style="overflow: scroll">
					{{ domain.dkim.selector }}._domainkey.{{ domain.domain }}
				</div>
				<span class="block mb1 h5">With content:</span>
				<div class="p1 bg-darken-1 mb2" style="overflow: scroll">
					v=DKIM1;t=s;p={{ domain.dkim.publicKey }}
				</div>
				<hr />
				<span class="mt1 btn green btn-outline h5" @click="verifyDKIM">Verify DKIM</span>
				<span class="ml1 mt1 btn red btn-outline h5" @click="confirmDisableDKIM">Disable DKIM</span>
			</span>
		</modal>
		<modal :show.sync="dmarcAttentionModal">
			<h4 slot="header">IT WILL BREAK YOUR EMAIL</h4>
			<span slot="body">
				<span class="block mb1 h5">Before you add a DMARC record, please make sure that your SPF and DKIM are setup correctly, because DMARC will instruct the recipient to strictly check for SPF and DKIM. If <i>either</i> of them fails to pass the validation, your emails <b>will be</b> rejected by the recipient.</span>
			</span>
		</modal>
		<modal :show.sync="dmarcSetupModal" v-if="securityCtx.dkim">
			<h4 slot="header">Adding DMARC Record</h4>
			<span slot="body">
				<span class="block mb1 h5">Add a <b>TXT</b> record for:</span>
				<div class="p1 bg-darken-1 mb1" style="overflow: scroll">
					_dmarc.{YOUR DOMAIN}
				</div>
				<span class="block mb1 h5">For example:</span>
				<div class="p1 bg-darken-1 mb1" style="overflow: scroll">
					_dmarc.{{ securityCtx.dkim[0].domain }}
				</div>
				<span class="block mb1 h5">With content:</span>
				<div class="p1 bg-darken-1 mb2" style="overflow: scroll">
					v=DMARC1;p=quarantine
				</div>
				<hr />
			</span>
		</modal>
		<modal :show.sync="dmarcCIDModal">
			<h4 slot="header">Disable DMARC Record</h4>
			<span slot="body">
				<span class="block mb1 h5">You <i>can</i> remove your DMARC record from your DNS, but the recipient will accept (forged) emails without DKIM Signature.</span>
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
			domainId: null,
			spfSetupModal: false,
			spfCIDModal: false,
			enableDKIMModal: false,
			setupDKIMModal: false,
			dmarcAttentionModal: false,
			dmarcSetupModal: false,
			dmarcCIDModal: false,
			disableGenerateButton: false
		}
	},
	computed: {
		domain: function() {
			if (!this.securityCtx.dkim) return {};
			var search = this.securityCtx.dkim.filter(function(o) {
				return o.domainId === this.domainId;
			}.bind(this));
			if (typeof search[0] !== 'undefined') return search[0];
			else return {};
		}
	},
	methods: {
		fetchSecurity: function() {
			this.getSecurity()
			.finally(function() {
				this.loading().go(100);
			}.bind(this))
		},
		popupEnableDKIM: function(domainId) {
			this.domainId = domainId;
			this.enableDKIMModal = true;
		},
		popupSetupDKIM: function(domainId) {
			this.domainId = domainId;
			this.setupDKIMModal = true;
		},
		generateKeyPair: function() {
			this.loading().go(30);
			this.disableGenerateButton = true;
			this.updateDomain({
				action: 'generateKeyPair',
				domainId: this.domainId
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.enableDKIMModal = false;
				this.setupDKIMModal = true;
				this.alert().success('keyPair generated.');
			}.bind(this))
			.finally(function() {
				this.loading().go(100);
				this.disableGenerateButton = false;
				this.fetchSecurity();
			}.bind(this))
		},
		verifyDKIM: function() {
			this.loading().go(30);
			this.updateDomain({
				action: 'verifyKeyPair',
				domainId: this.domainId
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.setupDKIMModal = false;
				this.alert().success('DKIM is setup correctly.');
			}.bind(this))
			.finally(function() {
				this.loading().go(100);
			}.bind(this))
		},
		confirmDisableDKIM: function() {
			this.alert()
			.okBtn("Yes")
			.cancelBtn("No")
			.confirm('<span class="block h5">Are you sure that you want to disable DKIM for this domain? The keypair will be REMOVED, and your outbound emails will NOT be signed.</span>')
			.then(function(resolved) {
				resolved.event.preventDefault();

				if (resolved.buttonClicked !== 'ok') return;

				this.updateDomain({
					action: 'deleteKeyPair',
					domainId: this.domainId
				})
				.then(function(res) {
					if (typeof res === 'undefined') return;
					this.setupDKIMModal = false;
					this.alert().success('keyPair deleted.');
				}.bind(this))
				.finally(function() {
					this.loading().go(100);
					this.fetchSecurity();
				}.bind(this))
			}.bind(this))
		}
	},
	ready: function() {
		this.setTitle('Security');
		this.fetchSecurity();
	}
}
</script>
