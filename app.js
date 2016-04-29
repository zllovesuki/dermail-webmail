module.exports = function() {
	var express = require('express'),
		path = require('path'),
		logger = require('morgan'),
		config = require('./config.js'),
		fs = require('fs'),
		app = express();

	if (process.env.RDB_HOST) app.use(logger('dev'));

	if (process.env.RDB_HOST) {
		app.get('/', function(req, res, next) {
			res.sendFile(__dirname + '/src/dev.html');
		});
	}

	app.get('/sw.js', function(req, res, next) {
		fs.readFile(__dirname + '/src/sw.js', 'utf8', function (err, data) {
			if (err) {
				return next(err);
			}
			var apiEndpoint = config.apiEndpoint;
			var version = '/v' + config.apiVersion;
			var result = data.replace(/__APIENDPOINT__/g, apiEndpoint + version);
			res.header("Content-Type", "text/javascript");
			res.end(result);
		})
	});

	app.use(express.static(path.join(__dirname, 'public')));

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
	  var err = new Error('Not Found');
	  err.status = 404;
	  next(err);
	});

	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
	  app.use(function(err, req, res, next) {
	    res.status(err.status || 500);
		res.send({
			message: err.message,
			error: err
	    });
	  });
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
	  res.status(err.status || 500);
	  res.send({
		  message: err.message,
		  error: {}
	  });
	});

	return app;
};
