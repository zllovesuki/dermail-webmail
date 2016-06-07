var config = require('../../config.js');
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

	http: function(ctx, action, endpoint, header, data) {
		header = !!header ? {
			headers: ctx.st.getHeader()
		}: {};
		data = data || {};
		return ctx.$http[action](endpoint, data, header)
		.then(function(res) {
			return res;
		})
		.catch(function(res) {
			if (res.data.hasOwnProperty('message')) {
				ctx.st.alert.error(res.data.message);
			}else{
				ctx.st.alert.error(res.statusText);
			}
		})
	},

	getWithHeader: function(ctx, endpoint) {
		return this.http(ctx, 'get', endpoint, true)
	},

	postWithHeader: function(ctx, endpoint, data) {
		return this.http(ctx, 'post', endpoint, true, data)
	},

	postWithoutHeader: function(ctx, endpoint, data) {
		return this.http(ctx, 'post', endpoint, false, data)
	},

	ping: function(ctx) {
		return ctx.$http.get(PING_ENDPOINT, {}, {
			headers: ctx.st.getHeader()
		})
	},
	s3: function(ctx) {
		return ctx.$http.get(S3_ENDPOINT, {}, {
			headers: ctx.st.getHeader()
		})
	},
	getSecurity: function(ctx) {
		return this.getWithHeader(ctx, GETSECURITY_ENDPOINT);
	},
	getAccounts: function(ctx) {
		return this.getWithHeader(ctx, GETACCOUNTS_ENDPOINT);
	},
	login: function(ctx, data) {
		return this.postWithoutHeader(ctx, LOGIN_ENDPOINT, data);
	},
	getAccount: function(ctx) {
		return this.postWithHeader(ctx, GETACCOUNT_ENDPOINT, ctx.$route.params);
	},
	getFoldersInAccount: function(ctx) {
		return this.postWithHeader(ctx, GETFOLDERS_ENDPOINT, ctx.$route.params);
	},
	getFolder: function(ctx) {
		return this.postWithHeader(ctx, GETFOLDER_ENDPOINT, ctx.$route.params);
	},
	getMailsInFolder: function(ctx, additional) {
		var data = Object.assign(ctx.$route.params, additional)
		return this.postWithHeader(ctx, GETMAILSINFOLDER_ENDPOINT, data);
	},
	getMail: function(ctx) {
		return this.postWithHeader(ctx, GETMAIL_ENDPOINT, ctx.$route.params);
	},
	getAddress: function(ctx, data) {
		return this.postWithHeader(ctx, GETADDRESS_ENDPOINT, data);
	},
	getFilters: function(ctx) {
		return this.postWithHeader(ctx, GETFILTERS_ENDPOINT, ctx.$route.params);
	},
	modifyFilter: function(ctx, data) {
		return this.postWithHeader(ctx, MODIFYFILTER_ENDPOINT, data);
	},
	searchWithFilter: function(ctx, data) {
		return this.postWithHeader(ctx, SEARCHWITHFILTER_ENDPOINT, data);
	},
	searchMailsInAccount: function(ctx, data) {
		return this.postWithHeader(ctx, SEARCHMAILSINACCOUNT_ENDPOINT, data);
	},
	updateMail: function(ctx, data) {
		return this.postWithHeader(ctx, UPDATEMAIL_ENDPOINT, data);
	},
	updateFolder: function(ctx, data) {
		return this.postWithHeader(ctx, UPDATEFOLDER_ENDPOINT, data);
	},
	updateDomain: function(ctx, data) {
		return this.postWithHeader(ctx, UPDATEDOMAIN_ENDPOINT, data);
	},
	sendMail: function(ctx, data) {
		return this.postWithHeader(ctx, SENDMAIL_ENDPOINT, data);
	},
	UploadS3Stream: function(ctx, data) {
		return this.postWithHeader(ctx, UPLOADS3STREAM_ENDPOINT, data);
	},
	pushNotification: function(ctx, data) {
		return this.postWithHeader(ctx, PUSHSUB_ENDPOINT, data);
	},

	queue: function() {
		return queue;
	},

	grabFilters: function(ctx) {
		return this.getFilters(ctx).then(function(res) {
			ctx.st.putFilters(res.data);
		})
	},

	grabDependencies: Promise.method(function(priority, ctx) {
		var returnData;
		var listOfDependencies = [
			Promise.method(function(ctx) {
				if (Object.keys(ctx.st.account).length === 0 || priority === 1) {
					return this.getAccount(ctx).then(function(res) {
						if (typeof res === 'undefined') return;
						res.data.displayName = res.data['account'] + '@' + res.data['domain'];
						ctx.st.putAccount(res.data);
						return res.data;
					});
				}
			}.bind(this)),
			Promise.method(function(ctx) {
				return this.getFolder(ctx).then(function(res) {
					if (typeof res === 'undefined') return;
					ctx.st.putFolder(res.data);
					return res.data;
				});
			}.bind(this)),
			Promise.method(function(ctx) {
				return this.getMail(ctx).then(function(res) {
					if (typeof res === 'undefined') return;
					ctx.st.putMail(res.data);
					return res.data;
				});
			}.bind(this))
		];

		return Promise.map(listOfDependencies, function(data, index) {
			var eval = index + 1;
			if (eval > priority) return;
			return listOfDependencies[index](ctx).then(function(res) {
				if (priority === eval) {
					returnData = res;
				}
			})
		}, { concurrency: 3 })
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
