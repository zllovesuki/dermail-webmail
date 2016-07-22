var alertify = require('alertify.js'),
	Nanobar = require('nanobar'),
	Vue = require('Vue'),
	Vuex = require('vuex');

Vue.use(Vuex);

var state = {

	token: null,

	storage: null,

	colors: ['aqua', 'blue', 'black', 'navy', 'teal', 'green', 'olive', 'lime', 'orange', 'red', 'fuchsia', 'purple', 'maroon'],

	zoomFactor: (screen.width > 768 ? 0.1 : 0.5),

	authenticated: false,
	title: 'Index',

	addresses: [],
	accounts: [],
	account: {},
	_folders: [],
	folders: [],
	folder: {},
	mails: [],
	mail: {},

	starOnly: false,

	filters: [],

	color: 'black',
	loading: new Nanobar(),
	blockLoadingOnce: true,

	lastFolderId: null,
	noMailsLeft: false,

	hideInMoveOptions: [
		'spam',
		'trash'
	],

	hideReadUnread: [
		'sent'
	],

	hideMoveToFolder: [
		'sent',
		'spam'
	],

	hideSpamButton: [
		'sent',
		'trash'
	],

	hideMoveToTrash: [
		'trash'
	],

	compose: {
		type: 'new',
		inReplyTo: null,
		references: [],
		markdown: '',
		addSubject: {
			type: '',
			subject: null
		},
		addTo: [],
		addAttachments: []
	},

	alert: alertify.reset().closeLogOnClick(true).logPosition("bottom right"),

	s3: {},

	securityCtx: []
};

var mutations = {
	setColor: function(state, color) {
		state.color = color
	},
	setS3: function(state, s3) {
		state.s3 = s3;
	},
	setTitle: function(state, title) {
		state.title = title;
	},
	setToken: function(state, token) {
		state.token = token;
	},
	saveToken: function(state, token) {
		localStorage.setItem('jwtToken', token);
	},
	removeToken: function(state) {
		state.token = null;
		localStorage.removeItem('jwtToken')
	},
	setAuthenticated: function(state, isAuthenticated) {
		state.authenticated = isAuthenticated;
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
	}
};

var store = new Vuex.Store({
	state,
	mutations
})

module.exports = store;
