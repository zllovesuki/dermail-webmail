module.exports = {
	securityCtx: function(state) {
		return state.securityCtx
	},
	color: function(state) {
		return state.color
	},
	title: function(state) {
		return state.title
	},
	authenticated: function(state) {
		return state.authenticated
	},
	accounts: function(state) {
		return state.accounts
	}
}
