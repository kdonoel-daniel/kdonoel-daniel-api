import { N9ConfBaseConf } from '@neo9/n9-node-conf';
import type { MongoClientOptions } from 'mongodb';
import { N9Log, N9NodeRouting } from 'n9-node-routing';

export interface Conf extends N9ConfBaseConf {
	// n9-node-routing config
	http?: N9NodeRouting.HttpOptions;
	openapi?: N9NodeRouting.SwaggerOptions;
	log?: N9Log.Options;
	shutdown?: N9NodeRouting.ShutdownOptions;
	enableLogFormatJSON?: boolean;

	// Custom config
	mongo?: {
		url: string;
		options?: MongoClientOptions;
	};
	bodyParser?: {
		limit?: string;
	};
	metrics?: {
		isEnabled?: boolean;
		waitDurationMs?: number;
	};
	jwt?: {
		secret: string;
		expiresIn: string | number;
	};
	env?: string;
	name?: string;
	version?: string;
}
