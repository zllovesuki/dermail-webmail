var io = require('socket.io-client/socket.io.js');

module.exports = {
	socket: '',
	connect: function(that, api) {
		var _this = this;
		this.socket = io.connect(api.getRoot());
		this.socket.on('connect', function() {
			_this.socket
			.emit('authenticate', { token: that.st.getToken() })
		});
		this.socket.on('Q', function(data) {
			if (data !== null) {
				that.st.alert[data.level](data.message);
			}
		});
		this.socket.on('new', function(data) {
			if (data !== null) {
				document.getElementById('sound').play();
				that.st.alert.success(data.message, function(ev) {
					ev.preventDefault();
					that.$route.router.go({ name: 'account', params: { accountId: data.accountId } })
				});
			}
		});
	},
	disconnect: function() {
		this.socket.disconnect();
	}
}
