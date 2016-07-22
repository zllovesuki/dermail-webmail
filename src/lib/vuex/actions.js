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

var listToTree = function(data, options) {
	options = options || {};
	var ID_KEY = options.idKey || 'id';
	var PARENT_KEY = options.parentKey || 'parent';
	var CHILDREN_KEY = options.childrenKey || 'children';

	var tree = [],
		childrenOf = {};
	var item, id, parentId;

	for (var i = 0, length = data.length; i < length; i++) {
		item = data[i];
		id = item[ID_KEY];
		parentId = item[PARENT_KEY] || 0;
		// every item may have children
		childrenOf[id] = childrenOf[id] || [];
		// init its children
		item[CHILDREN_KEY] = childrenOf[id];
		if (parentId != 0) {
			// init its parent's children object
			childrenOf[parentId] = childrenOf[parentId] || [];
			// push it into its parent's children object
			childrenOf[parentId].push(item);
		} else {
			tree.push(item);
		}
	};

	return tree;
}

var getHeader = function(state) {
	return {
		headers: {
			'Authorization': 'JWT ' + state.token
		}
	}
}

var _http = function($http, state, action, endpoint, header, data) {
	header = !!header ? getHeader(state): {};
	data = data || {};
	var handle;
	if (action === 'get') handle = $http[action](endpoint, header)
	else handle = $http[action](endpoint, data, header)
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

var getWithHeader = function($http, state, endpoint) {
	return _http($http, state, 'get', endpoint, true)
}

var postWithHeader = function($http, state, endpoint, data) {
	return _http($http, state, 'post', endpoint, true, data)
}

var postWithoutHeader = function($http, state, endpoint, data) {
	return _http($http, state, 'post', endpoint, false, data)
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
		var token = localStorage.getItem('jwtToken');
		if (token) {
			_.dispatch('setToken', token);
		}
		return token;
	},

	ping: function(_) {
		return this.$http.get(PING_ENDPOINT, getHeader(_.state))
	},
	getS3: function(_) {
		return this.$http.get(S3_ENDPOINT, getHeader(_.state))
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
					return _this.getAccount().then(function(res) {
						return res;
					});
				}
			}.bind(this)),
			Promise.method(function() {
				return _this.getFolder().then(function(res) {
					return res;
				});
			}.bind(this)),
			Promise.method(function() {
				return _this.getMail().then(function(res) {
					if (typeof res === 'undefined') return;
					var data = res.json();
					_.dispatch('putMail', data);
					return data;
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
		return getWithHeader(this.$http, _.state, GETSECURITY_ENDPOINT)
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
		return postWithHeader(this.$http, _.state, GETACCOUNT_ENDPOINT, _.state.route.params)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			data.displayName = data['account'] + '@' + data['domain'];
			_.dispatch('putAccount', data);
			return data;
		})
	},
	getAccounts: function(_) {
		return getWithHeader(this.$http, _.state, GETACCOUNTS_ENDPOINT)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			_.dispatch('putAccounts', data);
			return data;
		})
	},
	getFolder: function(_) {
		return postWithHeader(this.$http, _.state, GETFOLDER_ENDPOINT, _.state.route.params)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			_.dispatch('putFolder', data);
			return data;
		})
	},
	getFoldersInAccount: function(_) {
		return postWithHeader(this.$http, _.state, GETFOLDERS_ENDPOINT, _.state.route.params)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			_.dispatch('putFoldersTree', listToTree(data, {
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
		return postWithHeader(this.$http, _.state, GETMAILSINFOLDER_ENDPOINT, data)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			var data = res.json();
			this.putMails(this.mails.concat(data));
			return data;
		})
	},

	putMails: function(_, mails) {
		_.dispatch('putMails', mails);
	},

	updateDomain: function(_, data) {
		return postWithHeader(this.$http, _.state, UPDATEDOMAIN_ENDPOINT, data);
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
	removeMails: function(_) {
		_.dispatch('removeMails');
	}
}
