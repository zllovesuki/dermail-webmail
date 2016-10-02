module.exports = function() {
	var express = require('express'),
		path = require('path'),
		config = require('./config.js'),
		fs = require('fs'),
		app = express();

	app.enable('trust proxy');
	app.set('trust proxy', 'loopback, linklocal, uniquelocal');

	var root = __dirname + '/src/static/prod.html';
    var configDir = './config/';

	if (process.env.RDB_HOST) {
		root = __dirname + '/src/static/dev.html'
	}

    app.get('/public/manifest.json', function(req, res, next) {
		fs.readFile(configDir + '/manifest.json', 'utf8', function (err, data) {
			if (err) {
				return next(err);
			}
			res.end(data);
		})
	});

	app.use('/public', express.static(path.join(__dirname, 'public')));

	app.get('/sw.js', function(req, res, next) {
		fs.readFile(__dirname + '/src/static/sw.js', 'utf8', function (err, data) {
			if (err) {
				return next(err);
			}
			var apiEndpoint = config.apiEndpoint;
			var version = '/v' + config.apiVersion;
			var result = data.replace(/__APIENDPOINT__/g, apiEndpoint + version);
			result = result.replace(/__SITEURL__/g, config.siteURL);
			res.header("Content-Type", "text/javascript");
			res.end(result);
		})
	});

	app.use('/*', function(req, res, next) {
		return res.sendFile(root);
	});

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
