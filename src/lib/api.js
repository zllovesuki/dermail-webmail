var config = require('../../config.js');
var VERSION = '/v' + config.apiVersion;
var API_ROOT = config.apiEndpoint;
var API_ENDPOINT = API_ROOT + VERSION;
var LOGIN_ENDPOINT = API_ENDPOINT + '/login'
var PING_ENDPOINT = API_ENDPOINT + '/read/ping'
var S3_ENDPOINT = API_ENDPOINT + '/read/s3'
var GETACCOUNTS_ENDPOINT = API_ENDPOINT + '/read/getAccounts'
var GETACCOUNT_ENDPOINT = API_ENDPOINT + '/read/getAccount'
var GETFOLDERS_ENDPOINT = API_ENDPOINT + '/read/getFoldersInAccount'
var GETFOLDER_ENDPOINT = API_ENDPOINT + '/read/getFolder'
var GETMAILSINFOLDER_ENDPOINT = API_ENDPOINT + '/read/getMailsInFolder'
var GETMAIL_ENDPOINT = API_ENDPOINT + '/read/getMail'
var GETADDRESS_ENDPOINT = API_ENDPOINT + '/read/getAddress'
var GETFILTERS_ENDPOINT = API_ENDPOINT + '/read/getFilters'
var SEARCHWITHFILTER_ENDPOINT = API_ENDPOINT + '/read/searchWithFilter'
var SEARCHMAILSINACCOUNT_ENDPOINT = API_ENDPOINT + '/read/searchMailsInAccount'
var MODIFYFILTER_ENDPOINT = API_ENDPOINT + '/write/modifyFilter'
var UPDATEMAIL_ENDPOINT = API_ENDPOINT + '/write/updateMail'
var UPDATEFOLDER_ENDPOINT = API_ENDPOINT + '/write/updateFolder'
var UPDATEDOMAIN_ENDPOINT = API_ENDPOINT + '/write/updateDomain'
var PUSHSUB_ENDPOINT = API_ENDPOINT + '/write/pushSubscriptions'
var SENDMAIL_ENDPOINT = API_ENDPOINT + '/relay/sendMail'
var UPLOADS3STREAM_ENDPOINT = API_ENDPOINT + '/upload/s3Stream'

var queue = require('./socket.js');

module.exports = {

	getRoot: function() {
		return API_ROOT;
	},
	getEndpoint: function() {
		return API_ENDPOINT
	},

	ping: function(ct) {
		return ct.$http.get(PING_ENDPOINT, {}, {
			headers: ct.st.getHeader()
		})
	},
	s3: function(ct) {
		return ct.$http.get(S3_ENDPOINT, {}, {
			headers: ct.st.getHeader()
		})
	},
	getAccounts: function(ct) {
		return ct.$http.get(GETACCOUNTS_ENDPOINT, {}, {
			headers: ct.st.getHeader()
		})
	},
	login: function(ct, data) {
		return ct.$http.post(LOGIN_ENDPOINT, data);
	},
	getAccount: function(ct) {
		return ct.$http.post(GETACCOUNT_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	getFoldersInAccount: function(ct) {
		return ct.$http.post(GETFOLDERS_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	getFolder: function(ct) {
		return ct.$http.post(GETFOLDER_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	getMailsInFolder: function(ct, additional) {
		var data = Object.assign(ct.$route.params, additional)
		return ct.$http.post(GETMAILSINFOLDER_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	getMail: function(ct) {
		return ct.$http.post(GETMAIL_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	getAddress: function(ct, data) {
		return ct.$http.post(GETADDRESS_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	getFilters: function(ct) {
		return ct.$http.post(GETFILTERS_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	modifyFilter: function(ct, data) {
		return ct.$http.post(MODIFYFILTER_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	searchWithFilter: function(ct, data) {
		return ct.$http.post(SEARCHWITHFILTER_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	searchMailsInAccount: function(ct, data) {
		return ct.$http.post(SEARCHMAILSINACCOUNT_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	updateMail: function(ct, data) {
		return ct.$http.post(UPDATEMAIL_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	updateFolder: function(ct, data) {
		return ct.$http.post(UPDATEFOLDER_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	updateDomain: function(ct, data) {
		return ct.$http.post(UPDATEDOMAIN_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	sendMail: function(ct, data) {
		return ct.$http.post(SENDMAIL_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	UploadS3Stream: function(ct, data) {
		return ct.$http.post(UPLOADS3STREAM_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	pushNotification: function(ct, data) {
		return ct.$http.post(PUSHSUB_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},

	queue: function() {
		return queue;
	},

	grabFilters: function(ct) {
		this.getFilters(ct).then(function(res) {
			ct.st.putFilters(res.data);
			ct.st.loading.go(100);
		}, function(res) {
			if (res.data.hasOwnProperty('message')) {
				ct.st.alert.error(res.data.message);
			}
			ct.st.loading.go(100);
		});
	},

	grabDependencies: function(priority, ct, cb) {
		var that = this;
		switch(priority) {
			case 3: //mail.vue
			ct.$nextTick(function() {
				that.getMail(ct).then(function(res) {
					ct.st.putMail(res.data);
					if (cb && priority === 3) {
						cb(res.data);
					}
				}, function(res) {
					if (res.data.hasOwnProperty('message')) {
						ct.st.alert.error(res.data.message);
					}else{
						ct.st.alert.error(res.statusText);
					}
				});
			})
			case 2: //folder.vue
			ct.$nextTick(function() {
				that.getFolder(ct).then(function(res) {
					ct.st.putFolder(res.data);
					if (cb && priority === 2) {
						cb(res.data);
					}
				}, function(res) {
					if (res.data.hasOwnProperty('message')) {
						ct.st.alert.error(res.data.message);
					}else{
						ct.st.alert.error(res.statusText);
					}
				});
			})
			case 1: //account.vue
			if (Object.keys(ct.st.account).length === 0 || priority === 1) {
				ct.$nextTick(function() {
					that.getAccount(ct).then(function(res) {
						res.data.displayName = res.data['account'] + '@' + res.data['domain'];
						ct.st.putAccount(res.data);
						if (cb && priority === 1) {
							cb(res.data);
						}
					}, function(res) {
						if (res.data.hasOwnProperty('message')) {
							ct.st.alert.error(res.data.message);
						}else{
							ct.st.alert.error(res.statusText);
						}
					});
				})
			}
		}
	},
	inlineImage: function(src) {
		return API_ENDPOINT + '/safe/inline/?s=' + encodeURIComponent(src);
	},
	safeImage: function(src) {
		return API_ENDPOINT + '/safe/image/?s=' + encodeURIComponent(src);
	},
	safeLink: function(src) {
		return API_ENDPOINT + '/safe/href/?s=' + encodeURIComponent(src);
	}
}
