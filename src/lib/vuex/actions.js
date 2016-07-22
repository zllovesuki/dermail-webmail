var config = require('../../../config.js');
var Vue = require('Vue');
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

var vueHTTP = Vue.http;

var getHeader = function(state) {
	return {
		'Authorization': 'JWT ' + state.token
	}
}

var _http = function(state, action, endpoint, header, data) {
	header = !!header ? getHeader(state): {};
	data = data || {};
	var handle;
	if (action === 'get') handle = vueHTTP[action](endpoint, header)
	else handle = vueHTTP[action](endpoint, data, header)
	return handle
	.then(function(res) {
		return res;
	})
	.catch(function(res) {
		var data = res.json();
		if (data.hasOwnProperty('message')) {
			state.alert.error(data.message);
		}else{
			state.alert.error(res.statusText);
		}
	})
}

var getWithHeader = function(state, endpoint) {
	return _http(state, 'get', endpoint, true)
}

var postWithHeader = function(state, endpoint, data) {
	return _http(state, 'post', endpoint, true, data)
}

var postWithoutHeader = function(state, endpoint, data) {
	return _http(state, 'post', endpoint, false, data)
}

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
		return localStorage.getItem('jwtToken')
	},

	ping: function(_) {
		return vueHTTP.get(PING_ENDPOINT, getHeader(_.state))
	},
	login: function(_, data) {
		return postWithoutHeader(_.state, LOGIN_ENDPOINT, data)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			if (data.hasOwnProperty('token')) {
				_.dispatch('setToken', data.token);
				_.dispatch('saveToken', data.token);
				_.dispatch('setAuthenticated', true);
				//api.queue().connect(this, api);
				return true;
			};
		})
	},

	getS3: function(_) {
		return vueHTTP.get(S3_ENDPOINT, getHeader(_.state))
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = {};
			if (res && res.data) {
				data = res.json();
			}
			_.dispatch('setS3', data);
		})
	},
	getSecurity: function(_) {
		return getWithHeader(_.state, GETSECURITY_ENDPOINT)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = {};
			if (res && res.data) {
				data = res.json();
			}
			_.dispatch('putSecurity', data)
		})
	},
	getAccounts: function(_) {
		return getWithHeader(_.state, GETACCOUNTS_ENDPOINT)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			_.dispatch('putAccounts', data)
		})
	},

	updateDomain: function(_, data) {
		return postWithHeader(_.state, UPDATEDOMAIN_ENDPOINT, data);
	},

	setTitle: function(_, title) {
		_.dispatch('setTitle', title)
	},

	removeToken: function(_) {
		_.dispatch('removeToken')
	},
	removeAccount: function(_) {
		_.dispatch('removeAccount')
	},
	removeLastFolderId: function(_) {
		_.dispatch('removeLastFolderId')
	}
}
