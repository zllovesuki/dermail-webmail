module.exports = function(Vue, st) {
	Vue.transition("fade", {
		beforeLeave: function(t) {
			t.textContent = "";
		}
	});
}
