module.exports = function(_, router) {

	function randomColor() {
		var randomIndex = Math.floor(Math.random() * _.state.colors.length);
		return _.state.colors[randomIndex];
	}

	var color = localStorage.getItem('color');
	if (!color) color = randomColor();

	_.dispatch('setColor', color);

	router.beforeEach(function (transition) {
		var localToken = router.app.getLocalToken();
		if (router.app.isAuthenticated()) {
			return transition.next();
		}else if (localToken) {
			router.app.ping()
			.then(function(res) {
				_.dispatch('setAuthenticated', true);
				router.app.connectQueue();
				router.app.getS3()
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
					_.dispatch('removeToken');
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
