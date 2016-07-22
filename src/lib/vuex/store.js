var	Vue = require('Vue'),
	Vuex = require('vuex'),
	state = require('./state'),
	mutations = require('./mutations');

Vue.use(Vuex);

var store = new Vuex.Store({
	state,
	mutations
})

module.exports = store;
