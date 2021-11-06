import { Conf } from './index.models';

const conf: Conf = {
	http: {
		port: process.env.PORT || 6686,
	},
	mongo: {
		url: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kdos',
	},
	metrics: {
		isEnabled: true,
		waitDurationMs: 30 * 1_000,
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: '30 days',
	},
};

export default conf;
