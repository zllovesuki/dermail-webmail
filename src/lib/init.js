module.exports = function(st) {

	function randomColor() {
		var randomIndex = Math.floor(Math.random() * st.colors.length);
		return st.colors[randomIndex];
	}

	var color = localStorage.getItem('color');
	if (!color) color = randomColor();

	var colorCode = st.getStyleRuleValue('color', '.' + color);

	//st.setBarColor(color);

	st.color = color; // set color scheme
	st.Nanobar = require('nanobar');
	st.loading = new st.Nanobar({ bg: colorCode, id: 'nanobar'});
}
