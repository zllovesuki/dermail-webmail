module.exports = function(r) {
	var express = require('express'),
		path = require('path'),
		logger = require('morgan'),
		bodyParser = require('body-parser'),
		passport = require('passport'),
		config = require('./config'),
		cors = require('cors'),
		jwt = require('jwt-simple'),
		Queue = require('bull'),
		app = express();

	if (process.env.RDB_HOST) app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(passport.initialize());

	require('./lib/auth')(config, passport, r);

	authenticationMiddleware = passport.authenticate('jwt', { session: false });

	if (process.env.RDB_HOST) {
		app.get('/', function(req, res, next) {
			res.sendFile(__dirname + '/src/dev.html');
		});
	}

	app.use(express.static(path.join(__dirname, 'public')));

	app.use(cors());
	require('./api/authentication')(app, r, config);
	require('./api/read')(app, authenticationMiddleware, r);
	require('./api/write')(app, authenticationMiddleware, r);

	var messageQ = new Queue('dermail-send', config.redisQ.port, config.redisQ.host);
	require('./api/relay')(app, authenticationMiddleware, r, messageQ);

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
