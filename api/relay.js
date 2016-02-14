var validator = require('validator'),
	async = require('async'),
	config = require('../config'),
	_ = require('lodash'),
	helper = require('../lib/helper'),
	common = require('dermail-common'),
	Promise = require('bluebird'),
	mailcomposer = require("mailcomposer"),
	MailParser = require("mailparser").MailParser,
	htmlToText = require('html-to-text'),
	unNeededFields = [
		'showMore',
		'accountId',
		'toBox',
		'recipients'
	]

module.exports = function(app, authenticationMiddleware, r, messageQ) {
	app.post('/api/sendMail', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var compose = req.body;
		var accountId = req.body.accountId;

		if (req.user.accounts.indexOf(compose.accountId) === -1) {
			return res.status(403).send({message: 'Unspeakable horror.'}); // Early surrender: account does not belong to user
		}

		if (compose.recipients.to.length === 0) {
			return res.status(400).send({message: 'At least one "to" recipient is required.'});
		}

		delete compose.to;
		delete compose.cc;
		delete compose.bcc; // Better safe than sorry

		if (typeof compose.addHTML !== 'undefined') {
			compose.html += compose.addHTML;
			delete compose.addHTML;
		}

		async.each(compose.recipients, function(each, cb) {
			async.each(each, function(address, b) {
				if (validator.isEmail(address.address)) {
					b();
				}else{
					b('Invalid email: ' + address.address);
				}
			}, function(err) {
				cb(err);
			})
		}, function(err) {
			if (err) {
				return res.status(400).send({message: err});
			}

			return helper
			.userAccountMapping(r, userId, accountId)
			.then(function(account) {
				return common
				.getInternalFolder(r, accountId, 'Sent')
				.then(function(sentFolder) {
					var sender = {};
					sender.name = req.user.firstName + ' ' + req.user.lastName;
					sender.address = account['account'] + '@' + account['domain'];
					return doSendMail(r, sender, account.accountId, userId, compose, sentFolder, messageQ)
					.then(function() {
						return res.status(200).send();
					})
				})
			})
			.catch(function(e) {
				return next(e);
			})
		})
	});
}

function keepACopyInSentFolder(r, accountId, message, sentFolder) {
	return new Promise(function (resolve, reject) {
		return Promise.try(function() {
			var mail = mailcomposer(message);
			var stream = mail.createReadStream();
			var mailparser = new MailParser();
			mailparser.on("end", function(compose){

				// Compatibility with dermail-rx where it is JSON.stringify processed
				compose.date = compose.date.toISOString();

				async.each(compose.from, function(one, cb) {
					async.waterfall([
						// 2. Get our addressId
						function (done) {
							return common
							.getAddress(r, one.address, accountId)
							.then(function(addressObject) {
								var addressId = addressObject.addressId;
								var arrayOfFromAddress = [addressId];
								return done(null, compose, arrayOfFromAddress);
							})
							.catch(function(e) {
								return done(e);
							})
						},
						// 3. Assign "to" address in the database
						function (compose, arrayOfFromAddress, done) {

							var arrayOfToAddress = [];

							async.each(compose.to, function(one, cb) {
								if (!one) {
									return cb();
								}
								return common
								.getOrCreateAddress(r, one, accountId)
								.then(function(addressId) {
									arrayOfToAddress.push(addressId);
									return cb();
								})
								.catch(function(e) {
									return cb(e);
								})
							}, function(err) {
								if (err) {
									return done(err);
								}else{
									compose.from = arrayOfFromAddress;
									compose.to = arrayOfToAddress;
									return done(null, compose);
								}
							});
						},
						// Save the headers and message
						function (compose, done) {
							var headers = _.cloneDeep(compose.headers);
							delete compose.headers;
							// TODO Attachments
							compose.attachments = [];

							// Assign folder
							compose.folderId = sentFolder;
							// Assign account
							//message.userId = accountResult.userId;
							compose.accountId = accountId;
							// Default value
							compose.isRead = true;
							compose.isStar = false;
							compose.text = htmlToText.fromString(compose.html);

							//delete default messageId, if it has one
							if (compose.hasOwnProperty('messageId')) {
								compose._messageId = _.clone(compose.messageId);
								delete compose.messageId;
							}

							return common
							.saveHeaders(r, headers)
							.then(function(headerId) {
								compose.headers = headerId;
								return common
								.saveMessage(r, compose)
								.then(function(messageId) {
									return done(null);
								})
							})
							.catch(function(e) {
								return done(e);
							})
						}
					], function(err) {
						return cb(err);
					});
				}, function(err) {
					if (err) {
						return reject(err);
					}else{
						return resolve();
					}
				});
			});
			stream.pipe(mailparser);
		})
		.catch(function(e) {
			return reject(e);
		})
	})
}
var doSendMail = Promise.method(function(r, sender, accountId, userId, compose, sentFolder, messageQ) {
	var recipients = _.cloneDeep(compose.recipients);
	compose.from = sender;
	compose.userId = userId;
	unNeededFields.forEach(function(field) {
		delete compose[field];
	})
	_.merge(compose, recipients);
	return keepACopyInSentFolder(r, accountId, compose, sentFolder)
	.then(function() {
		messageQ.add(compose, config.Qconfig);
		return true;
	})
})
