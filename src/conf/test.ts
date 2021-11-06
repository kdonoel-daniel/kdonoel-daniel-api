import { Conf } from './index.models';

const conf: Conf = {
	http: {
		port: 6666,
	},
	mongo: {
		url: 'mongodb://127.0.0.1:27017/kdos-test',
	},
};

export default conf;
