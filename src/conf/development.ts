const conf: Conf = {
	log: {
		level: 'info',
		http: 'dev'
	},
	mongo: {
		url: 'mongodb://127.0.0.1:27017/kdos'
	},
	jwt: {
		secret: 'secret_key',
		expiresIn: '30 days'
	},
};

export default conf;
