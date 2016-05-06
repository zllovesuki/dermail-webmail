module.exports = function(st) {

	function randomColor() {
		var randomIndex = Math.floor(Math.random() * st.colors.length);
		return st.colors[randomIndex];
	}

	var color = localStorage.getItem('color');
	if (!color) color = randomColor();

	st.color = color; // set color scheme
}
