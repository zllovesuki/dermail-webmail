var app = require('./app')(),
	config = require('./config'),
	server = app.listen(config.port);

console.log('Process ' + process.pid + ' is listening on port ' + config.port + ' to all incoming requests.')
