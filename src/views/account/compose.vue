<template>
	<div>
		<div class="overflow-hidden bg-white border rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<div class="left ml2">
						<address-button origin-text="From" :origin="accountForceToArray"></address-button>
					</div>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h6 not-clickable inline">To: </span>
					<template v-for="to in composing.recipients.to">
						<a class="muted h6 mxn1 bold btn {{ color }}" @click="removeRecipient" data-where="to" data-recipient="{{ to.address }}">
							{{ to.name + ' <' + to.address + '>' }}
						</a>
					</template>
					<input type="text" class="field border-none" placeholder="to..." data-where="to" @keyup="splitTag">
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix">
					<a class="muted h6 ml1 bold btn {{ color }}" @click="showMore">
						...
					</a>
				</div>
			</div>
			<div class="m0 p1" v-show="composing.showMore">
				<div class="clearfix">
					<span class="btn black h6 not-clickable inline">Cc: </span>
					<template v-for="cc in composing.recipients.cc">
						<a
							class="muted h6 mxn1 bold btn {{ color }}" @click="removeRecipient" data-where="cc" data-recipient="{{ cc.address }}" >
							{{ cc.name + ' <' + cc.address + '>' }}
						</a>
					</template>
					<input type="text" class="field border-none" placeholder="cc..." data-where="cc" @keyup="splitTag">
				</div>
			</div>
			<div class="m0 p1" v-show="composing.showMore">
				<div class="clearfix">
					<span class="btn black h6 not-clickable inline">Bcc: </span>
					<template v-for="bcc in composing.recipients.bcc">
						<a
							class="muted h6 mxn1 bold btn {{ color }}" @click="removeRecipient" data-where="bcc" data-recipient="{{ bcc.address }}">
							{{ bcc.name + ' <' + bcc.address + '>' }}
						</a>
					</template>
					<input type="text" class="field border-none" placeholder="bcc..." data-where="bcc" @keyup="splitTag">
				</div>
			</div>
		</div>
		<div class="overflow-hidden bg-white border rounded mb2">
			<div class="m0 p2">
				<div class="clearfix">
					<input type="text" class="col col-12 field border-none" placeholder="title..." v-model="composing.subject">
				</div>
			</div>
			<div class="m0 p2 border-top ">
				<autoresize-textarea></autoresize-textarea>
			</div>
			<div class="m0 p2 border-top" style="line-height: 1.5em;">
				{{{ composing.html }}}
			</div>
		</div>
		<div class="overflow-hidden bg-white border rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h6 not-clickable">Attachments: </span>
					<span class="btn black h5 muted {{ color }}">
						<label for="attachment-select" style="cursor: pointer;" v-show="!attachDisabled">
						(Click to attach a file)
						</label>
					</span>
				</div>
				<input type="file" v-on:change="handleUpload" style="display: none;" id="attachment-select">
			</div>
			<div class="m0 p1" v-show="composing.attachments.length > 0">
				<div class="clearfix">
					<template v-for="attachment in composing.attachments">
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ color }}" v-on:click="confirmDelete(attachment)">
							{{attachment.filename}}
						</a>
					</template>
				</div>
			</div>
		</div>
		<div class="overflow-hidden bg-white border rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<div class="left">
						<form v-on:submit.prevent="sanityCheck">
							<button class="h6 ml1 bold btn btn-primary" type="submit" :disabled.sync="submitButtonDisabled">
								{{ type }}
							</button>
							<span class="btn h6 muted not-clickable">{{ autoSaveText }}</span>
						</form>
					</div>
					<div class="right">
						<button class="h6 ml1 bold btn btn-primary bg-red muted" type="button" @click="loadAutoSave" v-if="loadAutoSaveEnabled">
							Load Auto Save
						</button>
						<button class="h6 ml1 bold btn btn-primary bg-red" type="button" @click="microsoftSucks">
							Attentions
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

var validator = require('validator');
var marked = require('marked');
marked.setOptions({
	breaks: true
});

var getters = require('../../lib/vuex/getters.js')
var actions = require('../../lib/vuex/actions.js')

module.exports = {
	data: function() {
		return {
			autoSaveText: null,
			blockAutoSave: true,
			composing: {
				accountId: '',
				type: 'new',
				showMore: false,
				subject: '',
				toBox: '',
				html: '',
				recipients: {
					to: [],
					cc: [],
					bcc: []
				},
				inReplyTo: null,
				attachments: [],
				references: []
			},
			submitButtonDisabled: false,
			attachDisabled: false,
			loadAutoSaveEnabled: false
		}
	},
	vuex: {
		getters: getters,
		actions: actions
	},
	computed: {
		accountForceToArray: function() {
			return [this.account];
		},
		type: function() {
			switch (this.composing.type) {
				case 'reply':
				return 'Reply';
				break;
				case 'forward':
				return 'Forward';
				break;
				default:
				return 'Send';
				break;
			}
		}
	},
	methods: {
		removeDuplicates: function(arr, prop) {
			var new_arr = [];
			var lookup  = {};

	 		for (var i in arr) {
				lookup[arr[i][prop]] = arr[i];
			}

			for (i in lookup) {
				new_arr.push(lookup[i]);
			}
			return new_arr;
		},
		pushTags: function(where, tag) {
			if (validator.isEmail(tag)) {
				this.getAddress({
					accountId: this.route.params.accountId,
					email: tag.toLowerCase().trim()
				})
				.then(function(res) {
					if (typeof res === 'undefined') return;
					var address = {};
					address.name = res.friendlyName;
					address.address = tag.toLowerCase().trim()
					this.composing.recipients[where].push(address);
					this.composing.recipients[where] = this.removeDuplicates(this.composing.recipients[where], 'address');
				});
			}
		},
		removeRecipient: function(e) {
			var recipient = e.target.getAttribute('data-recipient');
			var where = e.target.getAttribute('data-where');
			this.composing.recipients[where] = this.composing.recipients[where].filter(function(e) {
				return e.address !== recipient; // remove by value
			})
		},
		showMore: function(e) {
			this.composing.showMore = true;
			e.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode);
			// ugly hack
		},
		splitTag: function(e) {
			var value = e.target.value;
			var where = e.target.getAttribute('data-where');
			if (value.substr(-1) === ' ') {
				var val = value.substring(0, value.length - 1).trim();
				if (val.length > 5) { // Minimum length is like "a@b.cc", therefore at least 5
					this.pushTags(where, val);
				}
				e.target.value = '';
			}
		},
		sanityCheck: function(e) {
			if (this.composing.recipients.to.length === 0) {
				return this.alert().error('At least one "to" recipient is required.');
			}

			if (this.composing.subject.trim().length === 0) {
				this.alert()
				.okBtn("Yes")
				.cancelBtn("No")
				.confirm('Are you sure to send an email without a subject?')
				.then(function(resolved) {
					resolved.event.preventDefault();

					if (resolved.buttonClicked !== 'ok') return;

					this.doSendMail();

				}.bind(this))
			}else{
				this.doSendMail();
			}
		},
		doSendMail: function() {
			this.loading().go(30);
			this.submitButtonDisabled = true;
			this.composing.accountId = this.route.params.accountId;

			this.sendMail(this.composing)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.clearAutoSave();
				this.$route.router.go({ name: 'account', params: { accountId: this.route.params.accountId } });
			})
			.finally(function() {
				this.loading().go(100);
				this.submitButtonDisabled = false;
			})
		},
		resetCompose: function() {
			this.updateComposeMarkdown('');
			this.composing = {
				accountId: '',
				type: 'new',
				showMore: false,
				subject: '',
				toBox: '',
				html: '',
				recipients: {
					to: [],
					cc: [],
					bcc: []
				},
				inReplyTo: null,
				attachments: [],
				references: []
			}
		},
		handleUpload: function(event) {
			var file = event.target.files[0];

			if (!!!file) return;

			this.attachDisabled = true;

			this.loading().go(30);

			var	form = new FormData(),
				filename = file.name,
				hash;

			form.append('attachment', file);
			form.append('filename', filename);

			this.uploadS3Stream(form)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var data = res.json();
				hash = data.checksum;
				this.composing.attachments.push({
					mutable: true,
					filename: filename,
					path: this.returnS3URL(hash, encodeURIComponent(filename))
				});
				this.alert().success('File uploaded to S3!');
			}.bind(this))
			.finally(function() {
				this.loading().go(100);
				this.attachDisabled = false;
			})
		},
		confirmDelete: function(attachment) {
			if (!!!attachment.mutable) {
				return this.alert().error('Cannot remove inline attachment.');
			}
			this.alert()
			.okBtn("Yes")
			.cancelBtn("No")
			.confirm('Are you sure to remove this attachment?')
			.then(function(resolved) {
				resolved.event.preventDefault();

				if (resolved.buttonClicked !== 'ok') return;

				this.composing.attachments.$remove(attachment);
				this.alert().success('File detached!');

			}.bind(this))
		},
		microsoftSucks: function(e) {
			this.alert().alert("Microsoft's emails services (Live.com, Outlook, etc)" +
			" are known to give postmaster headaches (see <a href='" +
			"http://serverfault.com/questions/323747/hotmail-sender-id-always-fails-with-temperror-regardless-of-spf' " +
			"target='_blank'>here</a>). If you suspect that your are experiencing delivery problems, " +
			"please contact Microsoft to resolve the issue.");
		},
		loadAutoSave: function() {
			this.blockAutoSave = true;
			return this.getAutoSave()
			.then(function(compose) {
				if (compose === null) return;
				this.autoSaveText = 'Loaded from auto save';
				this.composing = compose;
			}.bind(this))
			.then(function() {
				this.blockAutoSave = false;
			}.bind(this))
		}
	},
	watch: {
		'compose.markdown': function(val, oldVal) {
			marked(val, function(err, content) {
				this.composing.html = content;
			}.bind(this))
			if (this.blockAutoSave) return;
			this.autoSaveText = 'Saving...';
			this.storage.setItem('md-' + this.route.params.accountId, this.compose.markdown)
			.then(function() {
				return this.storage.setItem('compose-'+ this.route.params.accountId, this.composing)
			}.bind(this))
			.then(function() {
				this.autoSaveText = 'Last saved on ' + this.$moment(new Date()).format('hh:mm:ss a');
			}.bind(this))
		}
	},
	created: function() {

		this.resetCompose();

		this.setTitle('Compose');

		if (this.compose.addTo.length > 0) {
			this.compose.addTo.forEach(function(tag) {
				this.pushTags('to', tag.account + '@' + tag.domain);
			}.bind(this))
			this.resetComposeAddTo();
		}

		if (this.compose.addSubject.subject !== null) {
			this.composing.subject = this.compose.addSubject.type + this.compose.addSubject.subject
			this.resetComposeAddSubject();
		}

		if (this.compose.addAttachments.length > 0) {
			this.composing.attachments = this.compose.addAttachments;
			this.resetComposeAddAttachmens();
		}

		if (this.compose.references.length > 0) {
			this.composing.references = this.compose.references;
			this.resetComposeReferences();
		}

		if (this.compose.inReplyTo !== null) {
			this.composing.inReplyTo = this.compose.inReplyTo;
			this.resetComposeInReplyTo();
		}

		this.composing.type = this.compose.type;
		this.updateComposeType('new');

		this.storage.getItem('compose-' + this.route.params.accountId)
		.then(function(compose) {
			if (compose === null) return;
			this.loadAutoSaveEnabled = true;
		}.bind(this))

	},
	compiled: function() {
		this.grabDependencies(1)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			this.loading().go(100);
		}.bind(this))

		if (this.accounts.length === 0) {
			this.getAccounts();
		}
	},
	ready: function() {
		this.$nextTick(function() {
			this.blockAutoSave = false;
		})
	}
}
</script>

<style>
textarea {
	resize: none;
	overflow: hidden;
	min-height: 8em;
}
</style>
