var svg = {
	chevronRight: 'M12 1 L26 16 L12 31 L8 27 L18 16 L8 5 z',
	searchIcon: 'M12 0 A12 12 0 0 0 0 12 A12 12 0 0 0 12 24 A12 12 0 0 0 18.5 22.25 L28 32 L32 28 L22.25 18.5 A12 12 0 0 0 24 12 A12 12 0 0 0 12 0 M12 4 A8 8 0 0 1 12 20 A8 8 0 0 1 12 4',
	mailIcon: 'M0 6 L16 16 L32 6 z M0 9 L0 26 L32 26 L32 9 L16 19 z'
}

module.exports = function(Vue) {
	for (name in svg) {
		Vue.component(name, Vue.extend({
			template: '<svg class="icon gray" viewBox="0 0 32 32" style="fill:currentcolor">'+
				'<path d="' + svg[name] + '"></path>'+
			'</svg>'
		}))
	}
}
