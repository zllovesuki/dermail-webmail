var unicodeSubstring = require('unicode-substring')

function isDoubleByte(str) {
	for (var i = 0, n = str.length; i < n; i++) {
		if (str.charCodeAt( i ) > 255) { return true; }
	}
	return false;
}

module.exports = function(Vue) {
	Vue.filter('excerpt',
		function(value, length) {
			if (!value || value.length === 0) {
				return '...';
			}
			if (isDoubleByte(value)) length = length / 2;
			var short = unicodeSubstring(value, 0, length);
			if (short.length < value.length) {
				return short + '(...)';
			}else{
				return value;
			}
		}
	);
	Vue.filter('nameOrEmail',
		function(address) {
			if (!address.hasOwnProperty('friendlyName') || address.friendlyName.length === 0) {
				return address.account + '@' + address.domain;
			}else{
				return address.friendlyName;
			}
		}
	);
}
