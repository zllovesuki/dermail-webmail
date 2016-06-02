module.exports = function(api, st, router) {

	function randomColor() {
		var randomIndex = Math.floor(Math.random() * st.colors.length);
		return st.colors[randomIndex];
	}

	var color = localStorage.getItem('color');
	if (!color) color = randomColor();

	st.color = color; // set color scheme

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
					st.setS3(s3.data);
				})
				.catch(function(res) {
					st.alert.error('Unable to fetch S3 information, attachment functionalities may be impacted.');
				})
				transition.next();
			})
			.catch(function(res) {
				if (res && res.data && res.data.message === 'Token invalid.') {
					st.removeToken();
					st.alert.error('Token invalid, please login again.');
					transition.redirect({name: 'login'});
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
