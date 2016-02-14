var Queue = require('bull'),
	config = require('./config'),
	request = require('superagent'),
	r = require('rethinkdb'),
	config = require('./config'),
	async = require('async'),
	_ = require('lodash'),
	cluster = require('cluster'),
	numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
	var workers = [];

	var spawn = function(i) {
    	workers[i] = cluster.fork();
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
	var messageQ = new Queue('dermail-send', config.redisQ.port, config.redisQ.host);

	r.connect(config.rethinkdb).then(function(conn) {
		r.conn = conn;
		console.log('Process ' + process.pid + ' is listening to all incoming requests.')
		messageQ.process(function(job, done) {
			var data = job.data;
			sendNotification(r, data.userId, 'log', 'Queued for delivery.', function(err, queueId) {
				if (err) return done(err);

				var servers = _.cloneDeep(config.tx);

				servers.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} );

				var send = function(servers, data) {
					if (servers.length === 0) {
						var errorMsg = 'No more outbound servers available.'
						return sendNotification(r, data.userId, 'error', errorMsg, function(err, queueId) {
							return done(errorMsg);
						});
					}
					var server = servers.shift();
					var hook = server.hook;
					return request
					.post(hook)
					.timeout(10000)
					.send(data)
					.set('Accept', 'application/json')
					.end(function(err, res){
						if (err !== null || res.body.error !== null) {
							return sendNotification(r, data.userId, 'error', 'Trying another outbound server.', function(err, queueId) {
								return send(servers, data);
							})
						}
						return sendNotification(r, data.userId, 'success', 'Message sent.', function(err, queueId) {
							return done();
						})
					});
				}

				send(servers, data);
			});
		});
	});
}

function sendNotification(r, userId, level, msg, cb) {
	var insert = {};
	insert.userId = userId;
	insert.type = 'notification';
	insert.level = level;
	insert.message = msg;
	return r
	.table('queue')
	.insert(insert)
	.getField('generated_keys')
	.do(function (keys) {
		return keys(0);
	})
	.run(r.conn)
	.then(function(queueId) {
		cb(null, queueId);
	})
	.error(function(e) {
		cb(e);
	})
}
