var Vue = require('vue')

var VueRouter = require('vue-router')
var sync = require('vuex-router-sync').sync

var st = require('./lib/st.js')
var api = require('./lib/api.js')

Vue.use(VueRouter)
Vue.use(require('vue-resource'))
Vue.use(require('vue-moment'))

var _st = require('./lib/vuex/store.js');

var App = require('./app.vue')
var router = new VueRouter({
	history: true,
	saveScrollPosition: true
})

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
			'/:accountId/addresses': {
				name: 'addresses',
				component: require('./views/account/addresses.vue'),
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
		component: require('./views/setting/settingRoot.vue'),
		subRoutes: {
			'/': {
				name: 'settingIndex',
				component: require('./views/setting/index.vue')
			},
			'/pushNotification': {
				name: 'settingPushNotification',
				component: require('./views/setting/pushNotification.vue')
			},
			'/color': {
				name: 'settingColor',
				component: require('./views/setting/color.vue')
			},
			'/SPFDKIMDMARC': {
				name: 'settingSPFDKIMDMARC',
				component: require('./views/setting/SPFDKIMDMARC.vue')
			}
		}
	},
	'*': {
		component: require('./views/404.vue')
	}
})

require('./lib/init.js')(api, st, _st, router)
require('./lib/registerIcons.js')(Vue)
require('./lib/registerFilters.js')(Vue)
require('./lib/registerComponents.js')(Vue)
require('./lib/registerTransistions.js')(Vue, st)

window.App = App;

sync(_st, router);

router.start(App, '#app')
