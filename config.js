module.exports = {
	apiVersion: 2,
	port: require('./config.json').port,
	apiEndpoint: require('./config.json').apiEndpoint,
	socketEndpoint: require('./config.json').socketEndpoint,
	siteURL: require('./config.json').siteURL
}
