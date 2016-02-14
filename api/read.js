var unicodeSubstring = require('unicode-substring'),
	helper = require('../lib/helper'),
	common = require('dermail-common');
	crypto = require('crypto');

module.exports = function(app, authenticationMiddleware, r) {
	app.get('/api/ping', authenticationMiddleware, function(req, res, next) {
		return res.status(200).send('pong');
	});

	app.get('/api/getAccounts', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;

		return r
		.table('accounts')
		.getAll(userId, {index: 'userId'})
		.eqJoin('domainId', r.table('domains'))
		.zip()
		.pluck('accountId', 'account', 'domain', 'alias')
		.run(r.conn)
		.then(function(cursor) {
			return cursor.toArray();
		})
		.then(function(accounts) {
			return res.status(200).send(accounts);
		}).error(function(e) {
			return next(e);
		})
	});

	app.post('/api/getAccount', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var accountId = req.body.accountId;

		if (!accountId) {
			return res.status(400).send({message: 'Account ID Required'});
		}

		return helper
		.userAccountMapping(r, userId, accountId)
		.then(function(account) {
			return res.status(200).send(account);
		})
		.catch(function(e) {
			return next(e);
		})
	});

	app.post('/api/getFoldersInAccount', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var accountId = req.body.accountId;

		if (!accountId) {
			return res.status(400).send({message: 'Account ID Required'});
		}

		if (req.user.accounts.indexOf(accountId) === -1) {
			return res.status(403).send({message: 'Unspeakable horror.'}); // Early surrender: account does not belong to user
		}

		return r
		.table('folders')
		.getAll(accountId, {index: 'accountId'})
		.map(function(doc) {
			return doc.merge(function(z) {
				return {
					count: r.table('messages').getAll([doc('folderId'), false], {index: "unreadCount"}).count()
				}
			})
		})
		.run(r.conn)
		.then(function(cursor) {
			return cursor.toArray();
		})
		.then(function(folders) {
			if (folders.length === 0) {
				// WTF? IT SHOULD HAVE FUCKING FOLDERS
				return res.status(500).send({message: 'No folders found.'});
			}
			res.status(200).send(folders);
		}).error(function(e) {
			return next(e);
		})
	});

	app.post('/api/getFolder', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var accountId = req.body.accountId;
		var folderId = req.body.folderId;

		if (!folderId) {
			return res.status(403).send({message: 'Folder ID Required'});
		}

		if (!accountId) {
			return res.status(403).send({message: 'Account ID Required'});
		}

		if (req.user.accounts.indexOf(accountId) === -1) {
			return res.status(403).send({message: 'Unspeakable horror.'}); // Early surrender: account does not belong to user
		}

		return helper
		.accountFolderMapping(r, accountId, folderId)
		.then(function(folder) {
			return res.status(200).send(folder);
		})
		.catch(function(e) {
			return next(e);
		})

	});

	app.post('/api/getMailsInFolder', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var accountId = req.body.accountId;
		var folderId = req.body.folderId;
		var slice = req.body.slice || {};
		var lastDate = slice.date || r.maxval;
		var start = 0;
		var end = slice.perPage || 5;
		end = parseInt(end);

		if (!folderId) {
			return res.status(400).send({message: 'Folder ID Required'});
		}

		if (req.user.accounts.indexOf(accountId) === -1) {
			return res.status(403).send({message: 'Unspeakable horror.'}); // Early surrender: account does not belong to user
		}

		return helper
		.accountFolderMapping(r, accountId, folderId)
		.then(function(folder) {
			return r
			.table('messages')
			.orderBy({index: r.desc('folderDate')})
			.between([folderId, r.minval], [folderId, lastDate], {index: 'folderDate'})
			.slice(start, end)
			.pluck('messageId', 'date', 'to', 'from', 'folderId', 'accountId', 'subject', 'text', 'attachments', 'isRead', 'isStar')
			// Save some bandwidth and processsing
			.map(function(doc) {
				return doc.merge(function() {
					return {
						'to': doc('to').concatMap(function(to) { // It's like a subquery
							return [r.table('addresses').get(to).without('accountId', 'addressId', 'internalOwner')]
						}),
						'from': doc('from').concatMap(function(from) { // It's like a subquery
							return [r.table('addresses').get(from).without('accountId', 'addressId', 'internalOwner')]
						})
					}
				})
			})
			.run(r.conn)
			.then(function(cursor) {
				return cursor.toArray();
			})
			.then(function(messages) {
				for (var k in messages) {
					messages[k]['text'] = unicodeSubstring(messages[k]['text'], 0, 100);
				}
				return res.status(200).send(messages);
			})
			.error(function(e) {
				console.log(e);
				return res.status(200).send([]);
				//return next(e);
			})
		})
		.catch(function(e) {
			return next(e);
		})
	});

	app.post('/api/getMail', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var accountId = req.body.accountId;
		var messageId = req.body.messageId;

		if (!messageId) {
			return res.status(400).send({message: 'Message ID Required'});
		}

		if (req.user.accounts.indexOf(accountId) === -1) {
			return res.status(403).send({message: 'Unspeakable horror.'}); // Early surrender: account does not belong to user
		}

		return helper
		.messageAccountMapping(r, messageId, accountId)
		.then(function() {
			return r
			.table('messages')
			.get(messageId)
			.pluck('messageId', 'headers', 'date', 'to', 'from', 'replyTo', 'folderId', 'accountId', 'subject', 'html', 'attachments', 'isRead', 'isStar', 'replyTo')
			// Save some bandwidth and processsing
			.merge(function(doc) {
				return {
					'to': doc('to').concatMap(function(to) { // It's like a subquery
						return [r.table('addresses').get(to).without('accountId', 'addressId', 'internalOwner')]
					}),
					'from': doc('from').concatMap(function(from) { // It's like a subquery
						return [r.table('addresses').get(from).without('accountId', 'addressId', 'internalOwner')]
					}),
					'headers': r.table('messageHeaders').get(doc('headers')).without('accountId'),
					'attachments': doc('attachments').concatMap(function(attachment) { // It's like a subquery
						return [r.table('attachments').get(attachment)]
					})
				}
			})
			.run(r.conn)
			.then(function(message) {
				return res.status(200).send(message);
			})
			.error(function(e) {
				return next(e);
			})
		})
		.catch(function(e) {
			return next(e);
		});

	});

	app.post('/api/searchMailsInAccount', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var accountId = req.body.accountId;
		var searchString = req.body.searchString;

		if (!searchString) {
			return res.status(200).send([]); // Empty string gives empty result
		}

		if (req.user.accounts.indexOf(accountId) === -1) {
			return res.status(200).send([]); // Early surrender: account does not belong to user
		}

		/* Ideally, .indexCreate('messageAccountMapping', [r.row('messageId'), r.row('accountId')])
		** can be used without adding another index "accountId". But the behavior was unexpected.
		*/

		return r
		.table('messages')
		.getAll(accountId, {index: 'accountId'})
		.filter(function(doc){
			return r.or(doc('text').match("(?i)" + searchString), doc('subject').match("(?i)" + searchString))
		})
		.pluck('subject', 'messageId', 'folderId')
		.run(r.conn)
		.then(function(cursor) {
			return cursor.toArray();
		})
		.then(function(messages) {
			return res.status(200).send(messages);
		}).error(function(e) {
			return next(e);
		})
	});

	app.post('/api/getAddress', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var email = req.body.email;
		var accountId = req.body.accountId;
		var empty = {friendlyName: ''};

		if (req.user.accounts.indexOf(accountId) === -1) {
			return res.status(200).send(empty); // Early surrender: account does not belong to user
		}

		return common
		.getAddress(r, email, accountId, empty)
		.then(function(result) {
			delete result.addressId;
			return res.status(200).send(result);
		})
		.catch(function(e) {
			return next(e);
		})
	});

	app.post('/api/getFilters', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var accountId = req.body.accountId;
		var empty = [];

		if (req.user.accounts.indexOf(accountId) === -1) {
			return res.status(200).send(empty); // Early surrender: account does not belong to user
		}

		return r
		.table('filters')
		.getAll(accountId, { index: 'accountId'})
		.run(r.conn)
		.then(function(cursor) {
			return cursor.toArray();
		})
		.then(function(result) {
			return res.status(200).send(result);
		})
		.catch(function(e) {
			return next(e);
		})
	});

	app.post('/api/searchWithFilter', authenticationMiddleware, function(req, res, next) {
		var userId = req.user.userId;
		var accountId = req.body.accountId;

		var criteria = req.body.criteria;

		if (req.user.accounts.indexOf(accountId) === -1) {
			return res.status(200).send(empty); // Early surrender: account does not belong to user
		}

		return r
		.table('messages')
		.getAll(accountId, {index: 'accountId'})
		.map(function(doc) {
			return doc.merge(function() {
				return {
					'to': doc('to').concatMap(function(to) { // It's like a subquery
						return [r.table('addresses').get(to).without('accountId', 'addressId', 'internalOwner')]
					}),
					'from': doc('from').concatMap(function(from) { // It's like a subquery
						return [r.table('addresses').get(from).without('accountId', 'addressId', 'internalOwner')]
					}),
					'folder': r.table('folders').get(doc('folderId'))
				}
			})
		})
		.pluck('from', 'to', 'subject', 'text', 'folder', 'messageId')
		.run(r.conn)
		.then(function(cursor) {
			return cursor.toArray();
		})
		.then(function(result) {

			var arrayOfFrom = !!!criteria.from ? null : criteria.from.toLowerCase().replace(/\s+/g,'').split(',');
			var arrayOfTo = !!!criteria.to ? null : criteria.to.toLowerCase().replace(/\s+/g,'').split(',');
			var subject = !!!criteria.subject ? null : criteria.subject.toLowerCase().replace(/\s+/g,'').split(',');
			var contain = !!!criteria.contain ? null : criteria.contain.toLowerCase().replace(/\s+/g,'').split(',');
			var exclude = !!!criteria.exclude ? null : criteria.exclude.toLowerCase().replace(/\s+/g,'').split(',');

			return common
			.applyFilters(result, arrayOfFrom, arrayOfTo, subject, contain, exclude)
			.then(function(filtered) {
				for (var i = 0, flen = filtered.length; i < flen; i++) {
					delete filtered[i].text;
					delete filtered[i].to;
					delete filtered[i].from;
				}
				return res.status(200).send(filtered);
			})
		})
		.catch(function(e) {
			return next(e);
		})
	});

	app.get('/api/getPayload', function(req, res, next) {
		var hash = crypto.createHash('sha1').update(req.query.endpoint).digest("hex");

		return r
		.table('payload')
		.get(hash)
		.run(r.conn)
		.then(function(result) {
			if (result !== null) {
				return snapchat(r, hash)
				.then(function() {
					return res.status(200).send(result.payload);
				})
			}else{
				return res.status(200).send({});
			}
		})
		.catch(function(e) {
			return res.status(200).send({});
		})
	});

}

function snapchat(r, hash) {
	return r
	.table('payload')
	.get(hash)
	.delete()
	.run(r.conn)
}
