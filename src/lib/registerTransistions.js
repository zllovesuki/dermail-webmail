module.exports = function(Vue) {
	Vue.transition("fade", {
		beforeLeave: function(t) {
			t.textContent = "";
		}
	});
}
