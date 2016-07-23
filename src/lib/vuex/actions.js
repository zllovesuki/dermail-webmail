var config = require('../../../config.js');
var VERSION = '/v' + config.apiVersion;
var API_ROOT = config.apiEndpoint;
var API_ENDPOINT = API_ROOT + VERSION;
var LOGIN_ENDPOINT = API_ENDPOINT + '/login'
var PING_ENDPOINT = API_ENDPOINT + '/read/ping'
var GETSECURITY_ENDPOINT = API_ENDPOINT + '/read/security'
var S3_ENDPOINT = API_ENDPOINT + '/read/s3'
var GETACCOUNTS_ENDPOINT = API_ENDPOINT + '/read/getAccounts'
var GETACCOUNT_ENDPOINT = API_ENDPOINT + '/read/getAccount'
var GETFOLDERS_ENDPOINT = API_ENDPOINT + '/read/getFoldersInAccount'
var GETFOLDER_ENDPOINT = API_ENDPOINT + '/read/getFolder'
var GETMAILSINFOLDER_ENDPOINT = API_ENDPOINT + '/read/getMailsInFolder'
var GETMAIL_ENDPOINT = API_ENDPOINT + '/read/getMail'
var GETADDRESS_ENDPOINT = API_ENDPOINT + '/read/getAddress'
var GETADDDRESSES_ENDPOINT = API_ENDPOINT + '/read/getAddresses'
var GETFILTERS_ENDPOINT = API_ENDPOINT + '/read/getFilters'
var SEARCHWITHFILTER_ENDPOINT = API_ENDPOINT + '/read/searchWithFilter'
var SEARCHMAILSINACCOUNT_ENDPOINT = API_ENDPOINT + '/read/searchMailsInAccount'
var MODIFYFILTER_ENDPOINT = API_ENDPOINT + '/write/modifyFilter'
var UPDATEMAIL_ENDPOINT = API_ENDPOINT + '/write/updateMail'
var UPDATEFOLDER_ENDPOINT = API_ENDPOINT + '/write/updateFolder'
var UPDATEDOMAIN_ENDPOINT = API_ENDPOINT + '/write/updateDomain'
var UPDATEADDRESS_ENDPOINT = API_ENDPOINT + '/write/updateAddress'
var PUSHSUB_ENDPOINT = API_ENDPOINT + '/write/pushSubscriptions'
var SENDMAIL_ENDPOINT = API_ENDPOINT + '/relay/sendMail'
var UPLOADS3STREAM_ENDPOINT = API_ENDPOINT + '/upload/s3Stream'

var helper = require('./helper')

var self = module.exports = {
	loading: function(_, percentage) {
		return _.state.loading;
	},
	alert: function(_, msg) {
		return _.state.alert;
	},

	isAuthenticated: function(_) {
		return _.state.authenticated;
	},
	getLocalToken: function(_) {
		var token = localStorage.getItem('jwtToken');
		if (token) {
			_.dispatch('setToken', token);
		}
		return token;
	},

	setColor: function(_, color) {
		_.dispatch('setColor', color)
	},
	saveColor: function(_) {
		_.dispatch('saveColor')
	},

	clearAutoSave: function(_) {
		return _.state.storage.removeItem('composing-' + _.state.route.params.accountId).then(function() {
			return _.state.storage.removeItem('md-' + _.state.route.params.accountId)
		}.bind(this))
	},
	getAutoSave: function(_) {
		return _.state.storage.getItem('md-' + _.state.route.params.accountId)
		.then(function(markdown) {
			if (markdown === null) return;
			this.updateComposeMarkdown(markdown);
		}.bind(this))
		.then(function() {
			return _.state.storage.getItem('compose-' + _.state.route.params.accountId)
		}.bind(this))
	},

	ping: function(_) {
		return this.$http.get(PING_ENDPOINT, helper.getHeader(_.state))
	},
	getS3: function(_) {
		return this.$http.get(S3_ENDPOINT, helper.getHeader(_.state))
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = {};
			if (res && res.data) {
				data = res.json();
			}
			_.dispatch('setS3', data);
		})
		.catch(function(res) {
			this.alert().error('Unable to fetch S3 information, attachment functionalities may be impacted.');
		})
	},

	grabDependencies: function(_, priority) {
		var _this = this;
		var returnData;
		var listOfDependencies = [
			Promise.method(function() {
				if (Object.keys(_this.account).length === 0 || priority === 1) {
					return _this.getAccount()
					.then(function(res) {
						return res;
					});
				}
			}.bind(this)),
			Promise.method(function() {
				return _this.getFolder()
				.then(function(res) {
					return res;
				});
			}.bind(this)),
			Promise.method(function() {
				return _this.getMail()
				.then(function(res) {
					return res;
				});
			}.bind(this))
		];

		return Promise.map(listOfDependencies, function(data, index) {
			var eval = index + 1;
			if (eval > priority) return;
			return listOfDependencies[index]().then(function(res) {
				if (priority === eval) {
					returnData = res;
				}
			})
		}, { concurrency: 3 })
		.then(function() {
			return returnData;
		})
	},

	login: function(_, data) {
		return postWithoutHeader(this.$http, _.state, LOGIN_ENDPOINT, data)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			if (data.hasOwnProperty('token')) {
				_.dispatch('setToken', data.token);
				_.dispatch('setAuthenticated', true);
				//api.queue().connect(this, api);
				return true;
			};
		})
	},
	logout: function(_) {
		_.dispatch('setAuthenticated', false);
		//api.queue().disconnect();
		this.removeToken();
		this.alert().success('Logout successfully!');
	},
	getSecurity: function(_) {
		return helper.getWithHeader(this.$http, _.state, GETSECURITY_ENDPOINT)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = {};
			if (res && res.data) {
				data = res.json();
			}
			_.dispatch('putSecurity', data)
		})
	},
	getAccount: function(_) {
		return helper.postWithHeader(this.$http, _.state, GETACCOUNT_ENDPOINT, _.state.route.params)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			data.displayName = data['account'] + '@' + data['domain'];
			_.dispatch('putAccount', data);
			return data;
		})
	},
	getAccounts: function(_) {
		return helper.getWithHeader(this.$http, _.state, GETACCOUNTS_ENDPOINT)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			_.dispatch('putAccounts', data);
			return data;
		})
	},
	getFolder: function(_) {
		return helper.postWithHeader(this.$http, _.state, GETFOLDER_ENDPOINT, _.state.route.params)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			_.dispatch('putFolder', data);
			return data;
		})
	},
	getMail: function(_) {
		return helper.postWithHeader(this.$http, _.state, GETMAIL_ENDPOINT, _.state.route.params)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			_.dispatch('putMail', data);
			return data;
		})
	},
	getFoldersInAccount: function(_) {
		return helper.postWithHeader(this.$http, _.state, GETFOLDERS_ENDPOINT, _.state.route.params)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			_.dispatch('putFoldersTree', helper.listToTree(data, {
				idKey: 'folderId',
				parentKey: 'parent',
				childrenKey: 'child'
			}))
			_.dispatch('putFoldersFlat', data);
			return data;
		})
	},
	getMailsInFolder: function(_, additional) {
		var data = Object.assign(_.state.route.params, additional)
		return helper.postWithHeader(this.$http, _.state, GETMAILSINFOLDER_ENDPOINT, data)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			this.putMails(this.mails.concat(data));
			return data;
		})
	},
	getAddress: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, GETADDRESS_ENDPOINT, data)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			return data;
		})
	},
	getAddresses: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, GETADDDRESSES_ENDPOINT, data)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			this.putAddresses(data);
			return data;
		})
	},
	getFilters: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, GETFILTERS_ENDPOINT, _.state.route.params)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			this.putFilters(data);
			return data;
		})
	},

	pushNotification: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, PUSHSUB_ENDPOINT, data);
	},

	searchMailsInAccount: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, SEARCHMAILSINACCOUNT_ENDPOINT, data);
	},
	searchWithFilter: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, SEARCHWITHFILTER_ENDPOINT, data);
	},

	updateMail: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, UPDATEMAIL_ENDPOINT, data);
	},

	putMails: function(_, mails) {
		_.dispatch('putMails', mails);
	},
	putAddresses: function(_, data) {
		_.dispatch('putAddresses', data);
	},
	putFilters: function(_, data) {
		_.dispatch('putFilters', data);
	},

	updateComposeType: function(_, data) {
		_.dispatch('updateComposeType', data);
	},
	updateComposeMarkdown: function(_, data) {
		if (typeof data === 'object') data = data.target.value;
		_.dispatch('updateComposeMarkdown', data);
	},
	resetComposeAddTo: function(_) {
		_.dispatch('resetComposeAddTo');
	},
	appendComposeAddTo: function(_, data) {
		_.dispatch('appendComposeAddTo', data);
	},
	resetComposeAddSubject: function(_) {
		_.dispatch('resetComposeAddSubject');
	},
	updateComposeAddSubject: function(_, data) {
		_.dispatch('updateComposeAddSubject', data);
	},
	resetComposeAddAttachmens: function(_) {
		_.dispatch('resetComposeAddAttachmens');
	},
	appendComposeAddAttachmens: function(_, data) {
		_.dispatch('appendComposeAddAttachmens', data);
	},
	resetComposeReferences: function(_) {
		_.dispatch('resetComposeReferences');
	},
	updateComposeReferences: function(_, data) {
		_.dispatch('updateComposeReferences', data);
	},
	resetComposeInReplyTo: function(_) {
		_.dispatch('resetComposeInReplyTo');
	},
	updateComposeInReplyTo: function(_, data) {
		_.dispatch('updateComposeInReplyTo', data);
	},
	sendMail: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, SENDMAIL_ENDPOINT, data);
	},
	uploadS3Stream: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, UPLOADS3STREAM_ENDPOINT, data);
	},

	inlineImage: function(_, src) {
		return API_ENDPOINT + '/safe/inline/?s=' + encodeURIComponent(src);
	},
	safeImage: function(_, src) {
		return API_ENDPOINT + '/safe/image/?s=' + encodeURIComponent(src);
	},
	safeLink: function(_, src) {
		return API_ENDPOINT + '/safe/href/?s=' + encodeURIComponent(src);
	},
	safeRaw: function(_, params) {
		return API_ENDPOINT + '/safe/raw/' + params.accountId + '/' + params.messageId;
	},
	returnS3URL: function(_, checksum, fileName) {
		return 'https://' + _.state.s3.bucket + '.' + _.state.s3.endpoint + '/' + checksum + '/' + fileName;
	},

	updateDomain: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, UPDATEDOMAIN_ENDPOINT, data);
	},
	updateAddress(_, data) {
		return helper.postWithHeader(this.$http, _.state, UPDATEADDRESS_ENDPOINT, data);
	},

	updateFolder: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, UPDATEFOLDER_ENDPOINT, data);
	},

	modifyFilter: function(_, data) {
		return helper.postWithHeader(this.$http, _.state, MODIFYFILTER_ENDPOINT, data);
	},

	setTitle: function(_, title) {
		_.dispatch('setTitle', title)
	},
	resetLastFolderId: function(_) {
		_.dispatch('setLastFolderId', null)
	},
	setLastFolderId: function(_) {
		_.dispatch('setLastFolderId', _.state.route.params.folderId)
	},

	setReadInMail: function(_, read) {
		_.dispatch('setReadInMail', read);
	},
	setReadInMailArray: function(_, messageId, read) {
		_.dispatch('setReadInMailArray', messageId, read);
	},
	setStarInMailArray: function(_, messageId, star) {
		_.dispatch('setStarInMailArray', messageId, star)
	},
	removeMailInMailArray: function(_, messageId) {
		_.dispatch('removeMailInMailArray', messageId);
	},
	setNoMailsLeft: function(_, noMailsLeft) {
		_.dispatch('noMailsLeft', noMailsLeft);
	},
	checkIfNeedToSetNoMailsLeftToFalse: function(_, input) {
		if (input.length > 0) {
			this.setNoMailsLeft(false);
		}
	},

	flipStarOnly: function(_) {
		_.dispatch('flipStar');
		this.$broadcast('reloadFolder');
	},

	mailHouseKeeping: function(_, folderId, messageId, redirectToFolder) {
		var message = document.getElementsByClassName('mail-' + messageId)[0];
		var redirectToFolder = !!redirectToFolder;

		this.removeMailInMailArray(messageId);

		if (typeof message !== 'undefined') { // We are in folder view
			if (_.state.mails.length === 0) { // We just removed the last one!
				this.setNoMailsLeft(true);
			}
		}else{ // We are in mail view
			if (redirectToFolder)
				_.router.go({ name: 'folder', params: { accountId: _.state.route.params.accountId, folderId: folderId } })
			else
				_.router.go({ name: 'mail', params: { accountId: _.state.mail.accountId, folderId: folderId, messageId: _.state.mail.messageId } })
		}
	},

	removeToken: function(_) {
		_.dispatch('removeToken')
	},
	removeAccount: function(_) {
		_.dispatch('removeAccount')
	},
	removeLastFolderId: function(_) {
		_.dispatch('removeLastFolderId')
	},
	removeFolder: function(_) {
		_.dispatch('removeFolder')
	},
	removeFlatFolders: function(_) {
		_.dispatch('removeFlatFolders')
	},
	removeFolderTree: function(_) {
		_.dispatch('removeFolderTree')
	},
	removeAddressBook: function(_) {
		_.dispatch('removeAddressBook')
	},
	removeMail: function(_) {
		_.dispatch('removeMail');
	},
	removeMails: function(_) {
		_.dispatch('removeMails');
	},
	removeFilters: function(_) {
		_.dispatch('removeFilters');
	}
}
