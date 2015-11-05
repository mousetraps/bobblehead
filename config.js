var config = { };

config.rootUrl = process.env.ROOT_URL || 'http://localhost:3000/'

config.facebook = {
	appId: 			process.env.FACEBOOK_APPID 			|| '135664300124931',
	appSecret: 		process.env.FACEBOOK_APPSECRET, 	// never share app secret
	appNamespace: 	process.env.FACEBOOK_APPNAMESPACE 	|| 'bobblehead',
	redirectUri: 	process.env.FACEBOOK_REDIRECTURI 	|| config.rootUrl + 'login/callback'
}

module.exports = config;