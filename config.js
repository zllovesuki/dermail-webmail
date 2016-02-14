module.exports = {
	cluster: {
		basePort: 2000
	},
	rethinkdb: {
		host: '127.0.0.1',
		port: 28015,
        authKey: "",
        db: "dermail"
	},
	'redisQ': {
		host: '127.0.0.1',
		port: 6379
	},
	'Qconfig': {
		attempts: 10,
		backoff: {
			type: 'exponential',
			delay: 2000
		}
	},
	jwt: {
		secret: require('./config.json').jwt,
	},
	gcm_api_key: require('./config.json').gcm_api_key,
	tx: require('./config.json').tx
}
