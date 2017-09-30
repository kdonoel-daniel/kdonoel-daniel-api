import * as glob from 'glob-promise';
import * as  jwt from 'jsonwebtoken';
import { join } from 'path';
import 'reflect-metadata';
import { Action, createExpressServer, useContainer } from 'routing-controllers';
import { User } from './modules/users/users.models';
import { Container } from 'typedi';
// @formatter:off
// Load project conf & set as global
import conf from './conf';
import { Log } from './logs';

global.conf = conf;
global.log = new Log(conf.name);

import * as Mongo from './mongo';

/**
 * Setup routing-controllers to use typedi container.
 */
useContainer(Container);
/**
 * We create a new express server instance.
 * We could have also use useExpressServer here to attach controllers to an existing express instance.
 */
const expressApp = createExpressServer({
	/**
	 * We can add options about how routing-controllers should configure itself.
	 * Here we specify what controllers should be registered in our express server.
	 */
	controllers: [__dirname + '/modules/**/*.controller.?s'],
	authorizationChecker: async (action: Action, roles: string[]) => {
		const token = action.request.headers['authorization'];

		try {
			const user = jwt.verify(token, global.conf.jwt.secret) as User;
			return !!user;
		} catch (e) {
			return false;
		}
	},
	currentUserChecker: (action) => {
		const token = action.request.headers['authorization'];
		return jwt.verify(token, global.conf.jwt.secret) as User;
	}
});
// @formatter:on

// Provides a stack trace for unhandled rejections instead of the default message string.
process.on('unhandledRejection', (err: any) => {
	throw err;
});

// Start method
(async () => {
	// Profile startup boot time
	global.log.info('BEGIN startup');
	// Connect to MongoDB
	await Mongo.connect();
	// Run modules init
	const initFiles = await glob('**/*.init.+(ts|js)', {cwd: __dirname});
	await initFiles.reduce(async (promiseChain: any, item: string) => {
		return promiseChain.then(async () => {
			return require(join(__dirname, item)).default();
		});
	}, Promise.resolve());

	/**
	 * Start the express app.
	 */
	expressApp.listen(global.conf.http.port);

	global.log.info('Server is up and running at port ' + global.conf.http.port);

	// Log the startup time
	global.log.info('END   startup');
})();
