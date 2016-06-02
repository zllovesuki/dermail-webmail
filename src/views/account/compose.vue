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
					<template v-for="to in compose.recipients.to">
						<a class="muted h6 ml1 bold btn {{ st.color }}" @click="removeRecipient" data-where="to" data-recipient="{{ to.address }}">
							{{ to.name + ' <' + to.address + '>' }}
						</a>
					</template>
					<input type="text" class="field border-none" placeholder="to..." data-where="to" @keyup="splitTag">
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix">
					<a class="muted h6 ml1 bold btn {{ st.color }}" @click="showMore">
						...
					</a>
				</div>
			</div>
			<div class="m0 p1" v-show="compose.showMore">
				<div class="clearfix">
					<span class="btn black h6 not-clickable inline">Cc: </span>
					<template v-for="cc in compose.recipients.cc">
						<a
							class="muted h6 ml1 bold btn {{ st.color }}" @click="removeRecipient" data-where="cc" data-recipient="{{ cc.address }}" >
							{{ cc.name + ' <' + cc.address + '>' }}
						</a>
					</template>
					<input type="text" class="field border-none" placeholder="cc..." data-where="cc" @keyup="splitTag">
				</div>
			</div>
			<div class="m0 p1" v-show="compose.showMore">
				<div class="clearfix">
					<span class="btn black h6 not-clickable inline">Bcc: </span>
					<template v-for="bcc in compose.recipients.bcc">
						<a
							class="muted h6 ml1 bold btn {{ st.color }}" @click="removeRecipient" data-where="bcc" data-recipient="{{ bcc.address }}">
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
					<input type="text" class="col col-12 field border-none" placeholder="title..." v-model="compose.subject">
				</div>
			</div>
			<div class="m0 p2 border-top ">
				<autoresize-textarea></autoresize-textarea>
			</div>
			<div class="m0 p2 border-top" style="line-height: 1.5em;">
				{{{ compose.html }}}
			</div>
		</div>
		<div class="overflow-hidden bg-white border rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h6 not-clickable">Attachments: </span>
					<span class="btn black h5 muted {{ st.color }}">
						<label for="attachment-select" style="cursor: pointer;" v-show="!attachDisabled">
						(Click to attach a file)
						</label>
					</span>
				</div>
				<input type="file" v-on:change="handleUpload" style="display: none;" id="attachment-select">
			</div>
			<div class="m0 p1" v-show="compose.attachments.length > 0">
				<div class="clearfix">
					<template v-for="attachment in compose.attachments">
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" v-on:click="confirmDelete(attachment)">
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
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

var st = require('../../lib/st.js');
var api = require('../../lib/api.js');
var validator = require('validator');
var marked = require('marked');
marked.setOptions({
	breaks: true
});

module.exports = {
	data: function() {
		return {
			st: st,
			compose: {
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
			attachDisabled: false
		}
	},
	computed: {
		accountForceToArray: function() {
			return [this.st.account];
		},
		type: function() {
			switch (this.compose.type) {
				case 'reply':
				return 'Reply';
				break;
				default:
				return 'Send';
				break;
			}
		}
	},
	methods: {
		pushTags: function(where, tag) {
			if (validator.isEmail(tag)) {
				api.getAddress(this, {
					accountId: this.$route.params.accountId,
					email: tag.toLowerCase().trim()
				})
				.then(function(res) {
					if (typeof res === 'undefined') return;
					if (res.data.hasOwnProperty('friendlyName')) {
						var address = {};
						address.name = res.data.friendlyName;
						address.address = tag.toLowerCase().trim()
						this.compose.recipients[where].push(address);
						this.compose.recipients[where] = this.compose.recipients[where].filter(function(elem, index, self) {
							return index == self.indexOf(elem); // remove duplicate
						}) // http://stackoverflow.com/questions/16747798/delete-duplicate-elements-from-an-array
					}
				});
			}
		},
		removeRecipient: function(e) {
			var recipient = e.target.getAttribute('data-recipient');
			var where = e.target.getAttribute('data-where');
			this.compose.recipients[where] = this.compose.recipients[where].filter(function(e) {
				return e.address !== recipient; // remove by value
			})
		},
		showMore: function(e) {
			this.compose.showMore = true;
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
			if (this.compose.recipients.to.length === 0) {
				return this.st.alert.error('At least one "to" recipient is required.');
			}

			if (this.compose.subject.trim().length === 0) {
				var that = this;
				this.st.alert
				.okBtn("Yes")
				.cancelBtn("No")
				.confirm('Are you sure to send an email without a subject?')
				.then(function(resolved) {
					resolved.event.preventDefault();

					if (resolved.buttonClicked !== 'ok') return;

					that.sendMail();

				});
			}else{
				this.sendMail();
			}
		},
		sendMail: function() {
			this.st.loading.go(30);
			this.submitButtonDisabled = true;
			this.compose.accountId = this.$route.params.accountId;

			api.sendMail(this, this.compose)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.$route.router.go({ name: 'account', params: { accountId: this.$route.params.accountId } });
			})
			.finally(function() {
				this.st.loading.go(100);
				this.submitButtonDisabled = false;
			})
		},
		resetCompose: function() {
			this.st.compose.markdown = '';
			this.st.compose.type = 'new';
			this.compose = {
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
			var file = event.target.files[0],
				that = this;

			if (!!!file) return;

			that.attachDisabled = true;

			that.st.loading.go(30);

			var	form = new FormData(),
				filename = file.name,
				hash;

			form.append('attachment', file);
			form.append('filename', filename);

			api.UploadS3Stream(that, form)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				hash = res.data.checksum;
				that.compose.attachments.push({
					mutable: true,
					filename: filename,
					path: that.st.returnS3URL(hash, encodeURIComponent(filename))
				});
				that.st.alert.success('File uploaded to S3!');
			})
			.finally(function() {
				that.st.loading.go(100);
				that.attachDisabled = false;
			})
		},
		confirmDelete: function(attachment) {
			var that = this;
			if (!!!attachment.mutable) {
				return that.st.alert.error('Cannot remove inline attachment.');
			}
			this.st.alert
			.okBtn("Yes")
			.cancelBtn("No")
			.confirm('Are you sure to remove this attachment?')
			.then(function(resolved) {
				resolved.event.preventDefault();

				if (resolved.buttonClicked !== 'ok') return;

				that.compose.attachments.$remove(attachment);
				that.st.alert.success('File detached!');

			});
		}
	},
	watch: {
		'st.compose.markdown': function(val, oldVal) {
			var that = this;
			marked(val, function(err, content) {
				that.compose.html = content;
			});
		}
	},
	created: function() {

		var that = this;

		this.resetCompose();

		this.st.setTitle('Compose');

		if (this.st.compose.addTo.length > 0) {
			this.st.compose.addTo.forEach(function(tag) {
				that.pushTags('to', tag.account + '@' + tag.domain);
			})
			this.st.compose.addTo = [];
		}

		if (this.st.compose.addSubject.subject !== null) {
			this.compose.subject = this.st.compose.addSubject.type + this.st.compose.addSubject.subject
			this.st.compose.addSubject = {
				subject: null
			}
		}

		if (this.st.compose.addAttachments.length > 0) {
			this.compose.attachments = this.st.compose.addAttachments;
			this.st.compose.addAttachments = [];
		}

		if (this.st.compose.references.length > 0) {
			this.compose.references = this.st.compose.references;
			this.st.compose.references = [];
		}

		if (this.st.compose.inReplyTo !== null) {
			this.compose.inReplyTo = this.st.compose.inReplyTo;
			this.st.compose.inReplyTo = null;
		}

		this.compose.type = this.st.compose.type;

	},
	compiled: function() {
		var that = this;
		api.grabDependencies(1, this)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			that.st.loading.go(100);
		})

		if (this.st.accounts.length === 0) {
			this.$dispatch('getAccounts');
		}
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
