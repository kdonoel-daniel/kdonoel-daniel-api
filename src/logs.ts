import * as winston from 'winston';
// tslint:disable:no-namespace
export namespace Log {
	export interface Options {
		level?: string;
		console?: boolean;
		files?: FilesOptions[];
		http?: HttpOptions[];
	}

	export interface FilesOptions {
		level?: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
		filename: string;
		maxsize?: number;
		maxFiles?: number;
	}

	export interface HttpOptions {
		host?: string;
		port?: number;
		path?: string;
		auth?: {
			username: string;
			password: string;
		};
		ssl?: boolean;
	}
	export type ProfileMethod = (
		id: string,
		msg?: string,
		meta?: any,
		callback?: (
			err: Error,
			level: string,
			msg: string,
			meta: any) => void) => winston.LoggerInstance;
}
// tslint:enable

export class Log {

	public error: winston.LeveledLogMethod;
	public warn: winston.LeveledLogMethod;
	public info: winston.LeveledLogMethod;
	public debug: winston.LeveledLogMethod;
	public verbose: winston.LeveledLogMethod;
	public profile: Log.ProfileMethod;
	public stream: { write: (message: any) => winston.LoggerInstance };

	private name: string;
	private level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
	private options: Log.Options;
	private log: winston.LoggerInstance;

	constructor(name: string, options?: Log.Options) {
		this.options = options || {};
		// Options
		this.name = name;
		// tslint:disable-next-line:no-console
		this.level = process.env.LOG || this.options.level || 'info';
		this.options.console = (typeof this.options.console === 'boolean' ? this.options.console : true);
		this.options.files = this.options.files || [];
		this.options.http = this.options.http || [];
		// Logger
		this.log = this.createLogger();
		// Add methods
		this.error = this.log.error.bind(this.log);
		this.warn = this.log.warn.bind(this.log);
		this.info = this.log.info.bind(this.log);
		this.debug = this.log.debug.bind(this.log);
		this.verbose = this.log.verbose.bind(this.log);
		this.profile = this.log.profile.bind(this.log);
		// Add stream for morgan middleware
		this.stream = {
			write: (message) => this.info(message.replace(/\n$/, '')) // remove \n added by morgan at the end
		};
	}

	public module(name: string) {
		return new Log(`${this.name}:${name}`, this.options);
	}

	private createLogger() {
		const transports = this.getTransporters();
		// Instantiate the logger
		return new winston.Logger({
			transports,
			levels: {
				error: 0,
				warn: 1,
				info: 2,
				debug: 3,
				verbose: 4
			},
			colors: {
				error: 'red',
				warn: 'yellow',
				info: 'cyan',
				debug: 'green',
				verbose: 'blue'
			}
		});
	}

	private getTransporters() {
		const transports: any[] = [];
		// Add console transport
		if (this.options.console) {
			transports.push(
				new winston.transports.Console({
					colorize: true,
					level: this.level,
					label: this.name,
					timestamp: true,
					stderrLevels: ['error']
				})
			);
		}
		// Add file transport
		this.options.files.forEach((fileOptions, index) => {
			transports.push(
				new winston.transports.File({
					name: `file-transport-${index}`,
					level: this.level,
					...fileOptions
				})
			);
		});
		// Add http transport
		this.options.http.forEach((httpOptions, index) => {
			transports.push(
				new winston.transports.Http({
					name: `http-transport-${index}`,
					level: this.level,
					...httpOptions
				})
			);
		});
		return transports;
	}
}

export default (name: string, options?: Log.Options): Log => {
	return new Log(name, options);
};
