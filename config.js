module.exports = {
	apiVersion: 2,
	port: require('./config.json').port,
	graylog: require('./config.json').graylog || null,
	apiEndpoint: require('./config.json').apiEndpoint,
	siteURL: require('./config.json').siteURL
}
