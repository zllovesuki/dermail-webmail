module.exports = {
	initializeStorage: function(state) {
		state.storage = require('localforage');
		state.storage.config({
			driver: state.storage.INDEXEDDB,
			name: 'dermail',
			version: 1.0,
			storeName: 'keyvaluepairs',
			description: 'Storage in the browser'
		});
	},
	setColor: function(state, color) {
		state.color = color
	},
	saveColor: function(state) {
		localStorage.setItem('color', state.color);
	},
	setS3: function(state, s3) {
		state.s3 = s3;
	},
	setTitle: function(state, title) {
		state.title = title;
	},
	setToken: function(state, token) {
		state.token = token;
		localStorage.setItem('jwtToken', token);
	},
	removeToken: function(state) {
		state.token = null;
		localStorage.removeItem('jwtToken')
	},
	setAuthenticated: function(state, isAuthenticated) {
		state.authenticated = isAuthenticated;
	},
	setLastFolderId: function(state, id) {
		state.lastFolderId = id;
	},
	putMail: function(state, mail) {
		state.mail = mail;
	},
	putMails: function(state, mails) {
		state.mails = mails;
	},
	putAccounts: function(state, accounts) {
		state.accounts = accounts;
	},
	putAccount: function(state, account) {
		state.account = account;
	},
	removeAccount: function(state) {
		state.account = {};
	},
	putFolder: function(state, folder) {
		state.folder = folder;
	},
	putFoldersTree: function(state, folders) {
		state.folders = folders;
	},
	putFoldersFlat: function(state, folders) {
		state._folders = folders;
	},
	putAddresses: function(state, addresses) {
		state.addresses = addresses;
	},
	putFilters: function(state, filters) {
		state.filters = filters;
	},
	putSecurity: function(state, security) {
		state.securityCtx = security;
	},
	removeLastFolderId: function(state) {
		state.removeLastFolderId = null;
	},
	removeFolder: function(state) {
		state.folder = {};
	},
	removeFlatFolders: function(state) {
		state._folders = [];
	},
	removeFolderTree: function(state) {
		state.folders = [];
	},
	removeAddressBook: function(state) {
		state.addresses = [];
	},
	removeMails: function(state) {
		state.mails = [];
	},

	updateComposeType: function(state, data) {
		state.compose.type = data;
	},
	updateComposeMarkdown: function(state, data) {
		state.compose.markdown = data;
	},
	updateComposeAddTo: function(state, data) {
		state.compose.addTo = data;
	},
	updateComposeAddSubject: function(state, data) {
		state.compose.addSubject = data;
	},
	updateComposeAddAttachmens: function(state, data) {
		state.compose.addAttachments = data;
	},
	updateComposeReferences: function(state, data) {
		state.compose.references = data;
	},
	updateComposeInReplyTo: function(state, data) {
		state.compose.inReplyTo = data;
	}
};
