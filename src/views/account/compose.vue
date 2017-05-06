<template>
	<div>
		<div class="bg-white border rounded mb2">
			<div class="m0 p1">
				<div class="clearfix">
                    <span class="btn black h6 not-clickable inline-block">From: </span>
                    <a
                        v-show="composing.addresses.sender.name"
                        class="muted h6 mxn1 bold btn {{ color }}"
                        @click="removeAddress"
                        data-where="sender"
                        data-address="{{ composing.addresses.sender.address }}" >
                        {{ composing.addresses.sender.name + ' <' + composing.addresses.sender.address + '>' }}
                    </a>
                    <span class="btn mxn2" v-show="!composing.addresses.sender.name">
                        <form class="inline-block" onsubmit="return false;">
                            <div class="typeahead__container">
                                <div class="typeahead__field">
                                    <span class="typeahead__query">
                                        <input class="sender-typeahead-box"
                                               placeholder="from..."
                                               data-where="sender"
                                               autocomplete="off">
                                    </span>
                                </div>
                            </div>
                        </form>
                    </span>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix">
                    <span class="btn black h6 not-clickable inline-block">To: </span>
                    <template v-for="addr in composing.addresses.to" track-by="$index">
                        <a
                            class="muted h6 mxn1 bold btn {{ color }}"
                            @click="removeAddress"
                            data-where="to"
                            data-address="{{ addr.address }}" >
                            {{ addr.name + ' <' + addr.address + '>' }}
                        </a>
                    </template>
                    <span class="btn mxn2">
                        <form class="inline-block" onsubmit="return false;">
                            <div class="typeahead__container">
                                <div class="typeahead__field">
                                    <span class="typeahead__query">
                                        <input class="typeahead-box"
                                               placeholder="to..."
                                               data-where="to"
                                               autocomplete="off">
                                    </span>
                                </div>
                            </div>
                        </form>
                    </span>
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
                    <span class="btn black h6 not-clickable inline-block">Cc: </span>
                    <template v-for="addr in composing.addresses.cc" track-by="$index">
                        <a
                            class="muted h6 mxn1 bold btn {{ color }}"
                            @click="removeAddress"
                            data-where="cc"
                            data-address="{{ addr.address }}" >
                            {{ addr.name + ' <' + addr.address + '>' }}
                        </a>
                    </template>
                    <span class="btn mxn2">
                        <form class="inline-block" onsubmit="return false;">
                            <div class="typeahead__container">
                                <div class="typeahead__field">
                                    <span class="typeahead__query">
                                        <input class="typeahead-box"
                                               placeholder="cc..."
                                               data-where="cc"
                                               autocomplete="off">
                                    </span>
                                </div>
                            </div>
                        </form>
                    </span>
				</div>
			</div>
			<div class="m0 p1" v-show="composing.showMore">
				<div class="clearfix">
                    <span class="btn black h6 not-clickable inline-block">To: </span>
                    <template v-for="addr in composing.addresses.bcc" track-by="$index">
                        <a
                            class="muted h6 mxn1 bold btn {{ color }}"
                            @click="removeAddress"
                            data-where="bcc"
                            data-address="{{ addr.address }}" >
                            {{ addr.name + ' <' + addr.address + '>' }}
                        </a>
                    </template>
                    <span class="btn mxn2">
                        <form class="inline-block" onsubmit="return false;">
                            <div class="typeahead__container">
                                <div class="typeahead__field">
                                    <span class="typeahead__query">
                                        <input class="typeahead-box"
                                               placeholder="bcc..."
                                               data-where="bcc"
                                               autocomplete="off">
                                    </span>
                                </div>
                            </div>
                        </form>
                    </span>
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
					<template v-for="attachment in composing.attachments" track-by="path">
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

if (typeof jQuery === 'undefined') {
    var $ = require('jquery')
}

if (!$().typeahead) {
    require('jquery-typeahead')
}

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
            ownAddresses: [],
			storage: null,
			autoSaveText: null,
			blockAutoSave: true,
			composing: {
				accountId: '',
				type: 'new',
				showMore: false,
				subject: '',
				toBox: '',
				html: '',
				addresses: {
                    sender: {},
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
		initializeStorage: function() {
			this.storage = require('localforage');
			this.storage.config({
				driver: this.storage.INDEXEDDB,
				name: 'dermail',
				version: 1.0,
				storeName: 'keyvaluepairs',
				description: 'Storage in the browser'
			});
		},
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
		pushTags: function(where, obj) {
            if (validator.isEmail(obj.address)) {
                this.composing.addresses[where].push(obj);
                this.composing.addresses[where] = this.removeDuplicates(this.composing.addresses[where], 'address');
            }
		},
		removeAddress: function(e) {
			var address = e.target.getAttribute('data-address');
			var where = e.target.getAttribute('data-where');
            if (typeof this.composing.addresses[where].name !== 'undefined') {
                this.composing.addresses[where] = {}
            }else{
                this.composing.addresses[where] = this.composing.addresses[where].filter(function(e) {
    				return e.address !== address; // remove by value
    			})
            }
		},
		showMore: function(e) {
			this.composing.showMore = true;
			e.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode);
			// ugly hack
		},
		sanityCheck: function(e) {
			if (this.composing.addresses.to.length === 0) {
				return this.alert().error('At least one "to" address is required.');
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
				addresses: {
                    sender: {},
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
				return res.json()
			}.bind(this))
            .then(function(data) {
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
		clearAutoSave: function() {
			return this.storage.removeItem('composing-' + this.route.params.accountId)
			.then(function() {
				return this.storage.removeItem('md-' + this.route.params.accountId)
			}.bind(this))
		},
		loadAutoSave: function() {
			this.blockAutoSave = true;
			return this.storage.getItem('md-' + this.route.params.accountId)
			.then(function(markdown) {
				if (markdown === null) return;
				this.updateComposeMarkdown(markdown);
			}.bind(this))
			.then(function() {
				return this.storage.getItem('compose-' + this.route.params.accountId)
			}.bind(this))
			.then(function(compose) {
				if (compose === null) return;
				this.autoSaveText = 'Loaded from auto save';
				this.composing = compose;
			}.bind(this))
			.then(function() {
				this.blockAutoSave = false;
			}.bind(this))
		},
        loadTypeahead: function() {
            var self = this;
            $('.sender-typeahead-box').typeahead({
                maxItem: false,
                source: {
                    data: self.ownAddresses
                },
                display: ['name', 'address'],
                cancelButton: false,
                template: function(query, item) {
                    return '<span class="h6" style="word-wrap: break-word;">' + (item.isAlias ? '&#8651; ' : '') + '<strong>{{name}}</strong> &lt;{{address}}&gt;</span>'
                },
                templateValue: '{{address}}',
                callback: {
                    onClick: function(node, a, item, event) {
                        // http://stackoverflow.com/questions/40749099/vuejs-why-does-this-set-throw-error
                        // This is some legacy code... Need to update to vue 2.0 soon
                        self.$set(`composing.addresses.sender.name`, item.name)
                        self.$set(`composing.addresses.sender.address`, item.address)
                        self.$set(`composing.addresses.sender.isAlias`, item.isAlias)
                    },
                    onClickAfter: function(node, a, item, event) {
                        self.$nextTick(function() {
                            $(node[0]).val('')
                        })
                    }
                },
                selector: {
                    list: 'typeahead__list overflow-scroll'
                }
            })
            $('.typeahead-box').typeahead({
                dynamic: true,
                maxItem: false,
                minLength: 3,
                delay: 500,
                source: {
                    addresses: {
                        filter: false,
                        ajax: function(query) {
                            return {
                                type: 'POST',
                                url: self.returnGetAddressEP(),
                                dataType : "json",
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    accountId: self.route.params.accountId,
                                    query: query
                                }),
                                beforeSend: function(jqXHR, options) {
                                    jqXHR.setRequestHeader('Authorization', 'JWT ' + self.getAuthToken())
                                },
                                callback: {
                                    done: function(data, textStatus, jqXHR) {
                                        return data;
                                    },
                                    fail: function (jqXHR, textStatus, errorThrown) {
                                        self.alert().error(errorThrown);
                                        return []
                                    }
                                }
                            }
                        }
                    }
                },
                cancelButton: false,
                display: 'addresses',
                template: '<span class="h6" style="word-wrap: break-word;"><strong>{{name}}</strong> &lt;{{address}}&gt;</span>',
                templateValue: '{{address}}',
                callback: {
                    onClick: function(node, a, item, event) {
            			var where = node[0].getAttribute('data-where')
                        var obj = {
                            name: item.name,
                            address: item.address
                        }
            			self.pushTags(where, obj)
                    },
                    onClickAfter: function(node, a, item, event) {
                        self.$nextTick(function() {
                            $(node[0]).val('')
                        })
                    }
                },
                selector: {
                    list: 'typeahead__list overflow-scroll'
                }
            })
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

		this.initializeStorage();

		this.setTitle('Compose');

		if (this.compose.addTo.length > 0) {
			this.compose.addTo.forEach(function(obj) {
				this.pushTags('to', obj);
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
            return this.getOwnAddress({
                accountId: this.route.params.accountId
            }).then(function(res) {
                if (typeof res === 'undefined') return;
                this.ownAddresses = res;
                this.loading().go(100);
            })
		}.bind(this))
        .then(function() {
            this.loadTypeahead();
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
.typeahead__field input {
    width: 200px !important;
    border: 0 !important;
}
</style>
