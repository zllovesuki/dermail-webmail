var r = require('rethinkdb'),
	config = require('./config');

r.connect(config.rethinkdb).then(function(conn) {

	r.conn = conn;
	var app = require('./app')(r);
	var server = app.listen(config.cluster.basePort);
	io = require('socket.io')(server);
	require('./lib/socket')(io, r, config);
	require('./lib/gcm')(r, config);

	console.log('Process ' + process.pid + ' is listening on port ' + config.cluster.basePort + ' to all incoming requests.')
});
