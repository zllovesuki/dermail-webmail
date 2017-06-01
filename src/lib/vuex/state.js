var alertify = require('alertify.js'),
	Nanobar = require('nanobar');

module.exports = {

	token: null,

	colors: ['aqua', 'blue', 'black', 'navy', 'teal', 'green', 'olive', 'lime', 'orange', 'red', 'fuchsia', 'purple', 'maroon'],

	zoomFactor: (screen.width > 768 ? 0.1 : 0.5),

	authenticated: false,
	title: 'Index',

	accounts: [],
	account: {},
	_folders: [],
	folders: [],
	folder: {},
	mails: [],
	mail: {},
    unreadCount: {},

	slice: {
		perPage: 10,
		savedOn: null,
		starOnly: false
	},

	filters: [],

	color: 'black',
	loading: new Nanobar(),
	blockLoadingOnce: true,

	lastFolderId: null,
	lastAccountId: null,
	noMailsLeft: false,

	hideInMoveOptions: [
		'spam',
		'trash',
        'sent'
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

	alert: alertify.closeLogOnClick(true).logPosition("bottom right").maxLogItems(3),

	s3: {},

	securityCtx: []
};
