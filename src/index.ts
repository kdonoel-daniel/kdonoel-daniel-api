/* tslint:disable:ordered-imports */
import 'reflect-metadata';

import { MongoUtils } from '@neo9/n9-mongo-client';
import n9NodeConf from '@neo9/n9-node-conf';
// Dependencies
import n9NodeLog from '@neo9/n9-node-log';
import * as bodyParser from 'body-parser';
import { Express } from 'express';
import fastSafeStringify from 'fast-safe-stringify';
import { Server } from 'http';
import { Db } from 'mongodb';
import n9NodeRouting, { N9NodeRouting, Container, Action } from 'n9-node-routing';
import { join } from 'path';
// Add source map supports
// tslint:disable:no-import-side-effect
import 'source-map-support/register';
import { Conf } from './conf/index.models';
import { UsersUtils } from './modules/users/users.utils';
import { SessionsUtils } from './modules/sessions/sessions.utils';

// Start method
async function start(
	confOverride: Partial<Conf> = {},
): Promise<{ server: Server; db: Db; conf: Conf }> {
	// Load project conf & set as global
	const conf = (global.conf = n9NodeConf({
		path: join(__dirname, 'conf'),
		extendConfig: {
			key: 'starterApi',
			path: {
				relative: './env/env.yaml',
			},
		},
		override: {
			value: confOverride,
		},
	}) as Conf);

	const log = (global.log = n9NodeLog(conf.name, conf.log));
	// Load loaded configuration
	log.info(`Conf loaded: ${conf.env}`);

	// Profile startup boot time
	log.profile('startup');
	// print app infos
	const initialInfos = `${conf.name} version : ${conf.version} env: ${conf.env}`;
	log.info('-'.repeat(initialInfos.length));
	log.info(initialInfos);
	log.info('-'.repeat(initialInfos.length));

	// Connect to MongoDB
	const db = await MongoUtils.connect(conf.mongo.url, conf.mongo.options);
	Container.set('db', db);

	const pingDbs = [
		{
			name: 'MongoDB',
			thisArg: global.dbClient,
			isConnected: global.dbClient.isConnected,
		},
	];
	Container.set('pingDbs', pingDbs);

	const callbacksBeforeShutdown: N9NodeRouting.CallbacksBeforeShutdown[] = [];
	Container.set('callbacksBeforeShutdown', callbacksBeforeShutdown);

	// Load modules
	const { server } = await n9NodeRouting({
		hasProxy: false,
		path: join(__dirname, 'modules'),
		http: {
			...conf.http,
			beforeRoutingControllerLaunchHook: async (app2: Express) => {
				log.info('Add JWT decoder');
				SessionsUtils.SET_JWT_LOADER(conf, log, app2);

				app2.use(bodyParser.json({ limit: conf.bodyParser?.limit }));
			},
			ping: {
				dbs: pingDbs,
			},
			routingController: {
				currentUserChecker: (action) => {
					const token = action.request.headers['x-jwt-token'];
					return SessionsUtils.GET_TOKEN_CONTENT(token, global.conf.jwt.secret);
				},
			},
		},
		enableLogFormatJSON: conf.enableLogFormatJSON,
		openapi: conf.openapi,
		shutdown: {
			...conf.shutdown,
			callbacksBeforeShutdown,
		},
		prometheus: conf.metrics.isEnabled ? {} : undefined,
	});

	// Log the startup time
	log.profile('startup');
	// Return server and more for testing
	return { server, db, conf };
}

// Start server if not in test mode
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
	start()
		.then(() => {
			(global.log || console).info('Launch SUCCESS !');
		})
		.catch((e) => {
			(global.log || console).error(`Error on launch : `, {
				errString: fastSafeStringify(e),
			});
			throw e;
		});
}

export default start;
