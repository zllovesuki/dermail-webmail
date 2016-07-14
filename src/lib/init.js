module.exports = function(api, st, router) {

	function randomColor() {
		var randomIndex = Math.floor(Math.random() * st.colors.length);
		return st.colors[randomIndex];
	}

	var color = localStorage.getItem('color');
	if (!color) color = randomColor();

	st.color = color; // set color scheme

	st.storage = require('localforage');

	st.storage.config({
		driver: st.storage.INDEXEDDB,
		name: 'dermail',
		version: 1.0,
		storeName: 'keyvaluepairs',
		description: 'Storage in the browser'
	});

	router.beforeEach(function (transition) {
		if (st.isAuthenticated()) {
			return transition.next();
		}else if (st.getToken()) {
			api.ping(router.app)
			.then(function(res) {
				// We are fine
				st.setAuthenticated(true);
				// Message queue
				api.queue().connect(router.app, api);
				api.s3(router.app)
				.then(function(s3) {
					var data = {};
					if (res && res.data) {
						data = res.json();
					}
					st.setS3(data);
				})
				.catch(function(res) {
					st.alert.error('Unable to fetch S3 information, attachment functionalities may be impacted.');
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
					st.removeToken();
					st.alert.error('Token invalid, please login again.');
					this.$nextTick(function() {
						transition.redirect({name: 'login'});
					})
				}else{
					st.alert.error('Service not available, please try again later.');
				}
				st.loading.go(100);
			})
		}else if (transition.to.name !== 'login') {
			transition.redirect({name: 'login'});
		}else{
			transition.next();
		}
	})
}
