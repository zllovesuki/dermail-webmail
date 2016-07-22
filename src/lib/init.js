module.exports = function(api, st, _st, router) {

	function randomColor() {
		var randomIndex = Math.floor(Math.random() * st.colors.length);
		return st.colors[randomIndex];
	}

	var color = localStorage.getItem('color');
	if (!color) color = randomColor();

	st.color = color; // set color scheme
	_st.dispatch('setColor', color);

	st.storage = require('localforage');

	st.storage.config({
		driver: st.storage.INDEXEDDB,
		name: 'dermail',
		version: 1.0,
		storeName: 'keyvaluepairs',
		description: 'Storage in the browser'
	});

	router.beforeEach(function (transition) {
		var localToken = router.app.getLocalToken();
		if (router.app.isAuthenticated()) {
			return transition.next();
		}else if (localToken) {
			router.app.ping()
			.then(function(res) {
				_st.dispatch('setAuthenticated', true);
				//api.queue().connect(router.app, api);
				router.app.getS3()
				.catch(function(res) {
					router.app.alert().error('Unable to fetch S3 information, attachment functionalities may be impacted.');
				})
				.finally(function() {
					transition.next();
				})
			})
			.catch(function(res) {
				var data = {};
				if (res && res.data) {
					data = res.json();
				}
				if (data.message === 'Token invalid.') {
					_st.dispatch('removeToken');
					router.app.alert().error('Token invalid, please login again.');
					router.app.$nextTick(function() {
						transition.redirect({name: 'login'});
					})
				}else{
					router.app.alert().error('Service not available, please try again later.');
				}
				router.app.loading().go(100);
			})
		}else if (transition.to.name !== 'login') {
			transition.redirect({name: 'login'});
		}else{
			transition.next();
		}
	})
}
