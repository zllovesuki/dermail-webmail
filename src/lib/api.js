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

	getWithHeader: function(ct, endpoint) {
		return ct.$http.get(endpoint, {}, {
			headers: ct.st.getHeader()
		})
		.then(function(res) {
			return res;
		})
		.catch(function(res) {
			if (res.data.hasOwnProperty('message')) {
				ct.st.alert.error(res.data.message);
			}else{
				ct.st.alert.error(res.statusText);
			}
		})
	},

	postWithHeader: function(ct, endpoint, data) {
		return ct.$http.post(endpoint, data, {
			headers: ct.st.getHeader()
		})
		.then(function(res) {
			return res;
		})
		.catch(function(res) {
			if (res.data.hasOwnProperty('message')) {
				ct.st.alert.error(res.data.message);
			}else{
				ct.st.alert.error(res.statusText);
			}
		})
	},

	ping: function(ct) {
		return this.getWithHeader(ct, PING_ENDPOINT);
	},
	s3: function(ct) {
		return this.getWithHeader(ct, S3_ENDPOINT);
	},
	getAccounts: function(ct) {
		return this.getWithHeader(ct, GETACCOUNTS_ENDPOINT);
	},
	login: function(ct, data) {
		return ct.$http.post(LOGIN_ENDPOINT, data);
	},
	getAccount: function(ct) {
		return this.postWithHeader(ct, GETACCOUNT_ENDPOINT, ct.$route.params);
	},
	getFoldersInAccount: function(ct) {
		return this.postWithHeader(ct, GETFOLDERS_ENDPOINT, ct.$route.params);
	},
	getFolder: function(ct) {
		return this.postWithHeader(ct, GETFOLDER_ENDPOINT, ct.$route.params);
	},
	getMailsInFolder: function(ct, additional) {
		var data = Object.assign(ct.$route.params, additional)
		return this.postWithHeader(ct, GETMAILSINFOLDER_ENDPOINT, data);
	},
	getMail: function(ct) {
		return this.postWithHeader(ct, GETMAIL_ENDPOINT, ct.$route.params);
	},
	getAddress: function(ct, data) {
		return this.postWithHeader(ct, GETADDRESS_ENDPOINT, data);
	},
	getFilters: function(ct) {
		return this.postWithHeader(ct, GETFILTERS_ENDPOINT, ct.$route.params);
	},
	modifyFilter: function(ct, data) {
		return this.postWithHeader(ct, MODIFYFILTER_ENDPOINT, data);
	},
	searchWithFilter: function(ct, data) {
		return this.postWithHeader(ct, SEARCHWITHFILTER_ENDPOINT, data);
	},
	searchMailsInAccount: function(ct, data) {
		return this.postWithHeader(ct, SEARCHMAILSINACCOUNT_ENDPOINT, data);
	},
	updateMail: function(ct, data) {
		return this.postWithHeader(ct, UPDATEMAIL_ENDPOINT, data);
	},
	updateFolder: function(ct, data) {
		return this.postWithHeader(ct, UPDATEFOLDER_ENDPOINT, data);
	},
	updateDomain: function(ct, data) {
		return this.postWithHeader(ct, UPDATEDOMAIN_ENDPOINT, data);
	},
	sendMail: function(ct, data) {
		return this.postWithHeader(ct, SENDMAIL_ENDPOINT, data);
	},
	UploadS3Stream: function(ct, data) {
		return this.postWithHeader(ct, UPLOADS3STREAM_ENDPOINT, data);
	},
	pushNotification: function(ct, data) {
		return this.postWithHeader(ct, PUSHSUB_ENDPOINT, data);
	},

	queue: function() {
		return queue;
	},

	grabFilters: function(ct) {
		return this.getFilters(ct).then(function(res) {
			ct.st.putFilters(res.data);
		})
	},

	grabDependencies: Bluebird.method(function(priority, ct) {
		var that = this;
		var returnData;
		var listOfDependencies = [
			Bluebird.method(function(ct) {
				if (Object.keys(ct.st.account).length === 0 || priority === 1) {
					return that.getAccount(ct).then(function(res) {
						if (typeof res === 'undefined') return;
						res.data.displayName = res.data['account'] + '@' + res.data['domain'];
						ct.st.putAccount(res.data);
						return res.data;
					});
				}
			}),
			Bluebird.method(function(ct) {
				return that.getFolder(ct).then(function(res) {
					if (typeof res === 'undefined') return;
					ct.st.putFolder(res.data);
					return res.data;
				});
			}),
			Bluebird.method(function(ct) {
				return that.getMail(ct).then(function(res) {
					if (typeof res === 'undefined') return;
					ct.st.putMail(res.data);
					return res.data;
				});
			})
		];

		return Bluebird.mapSeries(listOfDependencies, function(data, index) {
			var eval = index + 1;
			if (eval > priority) return;
			return listOfDependencies[index](ct).then(function(res) {
				if (priority === eval) {
					returnData = res;
				}
			})
		})
		.then(function() {
			return returnData;
		})
	}),
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
