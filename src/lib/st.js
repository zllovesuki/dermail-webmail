var alertify = require('alertify.js'),
	Nanobar = require('nanobar');

module.exports = {

	storage: null,

	colors: ['aqua', 'blue', 'black', 'navy', 'teal', 'green', 'olive', 'lime', 'orange', 'red', 'fuchsia', 'purple', 'maroon'],

	authenticated: false,
	title: 'Index',

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
		this.s3 = s3;
	},

	putMail: function(mail) {
		this.mail = mail;
	},
	putMails: function(mails) {
		this.mails = mails;
	},
	putAccounts: function(accounts) {
		this.accounts = accounts;
	},
	putAccount: function(account) {
		this.account = account;
	},
	putFolder: function(folder) {
		this.folder = folder;
	},
	putFoldersTree: function(folders) {
		this.folders = folders;
	},
	putFoldersFlat: function(folders) {
		this._folders = folders;
	},

	putFilters: function(filters) {
		this.filters = filters;
	},

	setTitle: function(title) {
		this.title = title;
	},
	getHeader: function() {
		return {
			'Authorization': 'JWT ' + this.getToken()
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
		return this.authenticated;
	},
	setAuthenticated: function(state) {
		this.authenticated = state;
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
		var colorCode = this.getStyleRuleValue('color', '.' + color);
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
		return 'https://' + this.s3.bucket + '.' + this.s3.endpoint + '/' + checksum + '/' + fileName;
	}
}
