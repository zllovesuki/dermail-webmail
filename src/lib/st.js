var alertify = require('alertify.js'),
	Nanobar = require('nanobar');

var self = module.exports = {

	storage: null,

	colors: ['aqua', 'blue', 'black', 'navy', 'teal', 'green', 'olive', 'lime', 'orange', 'red', 'fuchsia', 'purple', 'maroon'],

	zoomFactor: 0.25,

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

	setS3: function(s3) {
		self.s3 = s3;
	},

	putMail: function(mail) {
		self.mail = mail;
	},
	putMails: function(mails) {
		self.mails = mails;
	},
	putAccounts: function(accounts) {
		self.accounts = accounts;
	},
	putAccount: function(account) {
		self.account = account;
	},
	putFolder: function(folder) {
		self.folder = folder;
	},
	putFoldersTree: function(folders) {
		self.folders = folders;
	},
	putFoldersFlat: function(folders) {
		self._folders = folders;
	},
	putAddresses: function(addresses) {
		self.addresses = addresses;
	},
	putFilters: function(filters) {
		self.filters = filters;
	},

	setTitle: function(title) {
		self.title = title;
	},
	getHeader: function() {
		return {
			'Authorization': 'JWT ' + self.getToken()
		}
	},
	getToken: function() {
		return localStorage.getItem('jwtToken')
	},
	setToken: function(token) {
		localStorage.setItem('jwtToken', token)
	},
	removeToken: function() {
		localStorage.removeItem('jwtToken')
	},

	isAuthenticated: function() {
		return self.authenticated;
	},
	setAuthenticated: function(state) {
		self.authenticated = state;
	},

	/*getStyleRuleValue: function(style, selector, sheet) {
	    var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
	    for (var i = 0, l = sheets.length; i < l; i++) {
	        var sheet = sheets[i];
	        if( !sheet.cssRules ) { continue; }
	        for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
	            var rule = sheet.cssRules[j];
	            if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
	                return rule.style[style];
	            }
	        }
	    }
	    return null;
	},

	setBarColor: function(color) {
		var colorCode = self.getStyleRuleValue('color', '.' + color);
		var metas = document.getElementsByTagName('meta');

		for (var i=0; i < metas.length; i++) {
			if (metas[i].getAttribute("name") && (
				metas[i].getAttribute("name") === "theme-color" ||
				metas[i].getAttribute("name") === "msapplication-navbutton-color"
			)) {
				metas[i].setAttribute("content", colorCode);
			}
			if (metas[i].getAttribute("name") && metas[i].getAttribute("name") === "apple-mobile-web-app-status-bar-style") {
				metas[i].setAttribute("content", color + "-translucent");
			}
		}
	},*/

	returnS3URL: function(checksum, fileName) {
		return 'https://' + self.s3.bucket + '.' + self.s3.endpoint + '/' + checksum + '/' + fileName;
	}
}
