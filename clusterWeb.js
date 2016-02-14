var r = require('rethinkdb'),
	config = require('./config'),
	cluster = require('cluster'),
	numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
	var workers = [];

	var spawn = function(i) {
		workers[i] = cluster.fork({
			WORKER_PORT: config.cluster.basePort + i,
			CURRENT_INSTANCE: i
		});
	};

	for (var i = 0; i < numCPUs; i++) {
		spawn(i);
	}
	cluster.on('online', function(worker) {
		console.log('Worker ' + worker.process.pid + ' is online.');
    });
	cluster.on('exit', function(worker, code, signal) {
		console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
		console.log('Starting a new worker...');
		spawn(i);
	});
}else{
	r.connect(config.rethinkdb).then(function(conn) {

		r.conn = conn;
		var app = require('./app')(r);
		var server = app.listen(process.env.WORKER_PORT);
		io = require('socket.io')(server);
		require('./lib/socket')(io, r, config);
		if (process.env.CURRENT_INSTANCE == 1) {
			require('./lib/gcm')(r, config); // Only one instance to do notification
		}

		console.log('Process ' + process.pid + ' is listening on port ' + process.env.WORKER_PORT + ' to all incoming requests.')
	});
}
