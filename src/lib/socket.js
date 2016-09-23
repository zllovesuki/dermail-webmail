var io = require('socket.io-client/socket.io.js');
var master;

module.exports = function(vue) {
	this.connect = function(_, ROOT) {
		master = io.connect(ROOT);
		master.on('connect', function() {
			master.emit('authenticate', { token: _.state.token })
		});
		master.on('Q', function(data) {
			if (data !== null) {
				_.state.alert[data.level](data.message);
			}
		});
		master.on('new', function(data) {
			if (data !== null) {
				vue.refreshFolderView(data.accountId)
				.then(function() {
					if (data.folder) {
						return vue.incrementallyGetMailsInFolder(data.folder.folderId)
					}else{
						return Promise.resolve();
					}
				})
				.then(function() {
					if (!data.push) return;
					document.getElementById('sound').play();
					_.state.alert.success(data.message, function(ev) {
						ev.preventDefault();
						if (data.folder) {
							_.router.go({ name: 'mail', params: { accountId: data.accountId, folderId: data.folder.folderId, messageId: data.messageId } })
						}else{
							_.router.go({ name: 'account', params: { accountId: data.accountId } })
						}
					});
				})
			}
		});
		master.on('debug', function(data) {
			console.log(data);
		});
	};
	this.disconnect = function() {
		return master.disconnect();
	}
	return this;
}
