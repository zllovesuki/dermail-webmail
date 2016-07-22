module.exports = {

	storage: function(state) {
		return state.storage;
	},

	hideInMoveOptions: function(state) {
		return state.hideInMoveOptions
	},
	hideReadUnread: function(state) {
		return state.hideReadUnread
	},
	hideMoveToFolder: function(state) {
		return state.hideMoveToFolder
	},
	hideSpamButton: function(state) {
		return state.hideSpamButton
	},
	hideMoveToTrash: function(state) {
		return state.hideMoveToTrash
	},

	securityCtx: function(state) {
		return state.securityCtx
	},
	color: function(state) {
		return state.color
	},
	colors: function(state) {
		return state.colors
	},
	title: function(state) {
		return state.title
	},
	authenticated: function(state) {
		return state.authenticated
	},
	account: function(state) {
		return state.account
	},
	accounts: function(state) {
		return state.accounts
	},
	folder: function(state) {
		return state.folder
	},
	folders: function(state) {
		return state.folders
	},
	flatFolders: function(state) {
		return state._folders
	},
	_starOnly: function(state) {
		return state.starOnly;
	},
	lastFolderId: function(state) {
		return state.lastFolderId;
	},
	mails: function(state) {
		return state.mails
	},
	noMailsLeft: function(state) {
		return state.noMailsLeft
	},
	route: function(state) {
		return state.route
	},
	addresses: function(state) {
		return state.addresses
	},
	compose: function(state) {
		return state.compose
	},
	filters: function(state) {
		return state.filters
	}
}
