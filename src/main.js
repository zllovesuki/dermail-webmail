var Vue = require('vue')
var VueRouter = require('vue-router')

var st = require('./lib/st.js')
var api = require('./lib/api.js')

Vue.use(VueRouter)
Vue.use(require('vue-resource'))
Vue.use(require('vue-moment'))

var App = Vue.extend(require('./app.vue'))
var router = new VueRouter()

require('./lib/init.js')(st)
require('./lib/registerIcons.js')(Vue)
require('./lib/registerFilters.js')(Vue)
require('./lib/registerComponents.js')(Vue)
require('./lib/registerTransistions.js')(Vue, st)

router.map({
	'/': {
		name: 'login',
		component: require('./views/login.vue')
	},
	'/accounts': {
		component: require('./views/account/accountRoot.vue'),
		subRoutes: {
			'/': {
				name: 'accounts',
				component: require('./views/account/accounts.vue')
			},
			'/:accountId': {
				name: 'account',
				component: require('./views/account/account.vue'),
			},
			'/:accountId/filter': {
				name: 'filter',
				component: require('./views/account/filter.vue'),
			},
			'/:accountId/compose': {
				name: 'compose',
				component: require('./views/account/compose.vue'),
			},
			'/:accountId/:folderId': {
				name: 'folder',
				component: require('./views/account/folder.vue')
			},
			'/:accountId/:folderId/:messageId': {
				name: 'mail',
				component: require('./views/account/mail.vue')
			}
		}
	},
	'/settings': {
		name: 'settings',
		component: require('./views/setting/settingRoot.vue')
	},
	'*': {
		component: require('./views/404.vue')
	}
})

router.beforeEach(function (transition) {
	if (!st.isAuthenticated() && transition.to.name !== 'login') {
		transition.redirect({name: 'login'});
	}else{
		transition.next();
	}
})

window.App = App;

router.start(App, '#app')
