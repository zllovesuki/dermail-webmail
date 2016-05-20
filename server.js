var app = require('./app')(),
	config = require('./config'),
	server = app.listen(config.port),
	bunyan = require('bunyan'),
	stream = require('gelf-stream'),
	log;

if (!!config.graylog) {
	log = bunyan.createLogger({
		name: 'Webmail',
		streams: [{
			type: 'raw',
			stream: stream.forBunyan(config.graylog)
		}]
	});
}else{
	log = bunyan.createLogger({
		name: 'Webmail'
	});
}

log.info('Process ' + process.pid + ' is listening on port ' + config.port + ' to all incoming requests.')
