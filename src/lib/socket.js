var io = require('socket.io-client/socket.io.js');

module.exports = function(vue) {
	this.socket = '',
	this.connect = function(_, ROOT) {
		var _this = this;
		this.socket = io.connect(ROOT);
		this.socket.on('connect', function() {
			_this.socket
			.emit('authenticate', { token: _.state.token })
		});
		this.socket.on('Q', function(data) {
			if (data !== null) {
				_.state.alert[data.level](data.message);
			}
		});
		this.socket.on('new', function(data) {
			if (data !== null) {
				document.getElementById('sound').play();
				if (data.folder) {
					vue.incrementallyGetMailsInFolder(data.folder.folderId)
				}
				_.state.alert.success(data.message, function(ev) {
					ev.preventDefault();
					if (data.folder) {
						_.router.go({ name: 'mail', params: { accountId: data.accountId, folderId: data.folder.folderId, messageId: data.messageId } })
					}else{
						_.router.go({ name: 'account', params: { accountId: data.accountId } })
					}
				});
			}
		});
		this.socket.on('debug', function(data) {
			console.log(data);
		});
	};
	this.disconnect = function() {
		return this.socket.disconnect();
	}
	return this;
}
