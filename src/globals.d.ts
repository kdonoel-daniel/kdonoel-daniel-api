interface Package {
	name: string;
	version: string;
}
// tslint:disable:no-namespace
declare namespace NodeJS {
	interface Global {
		log: any;
		conf: Conf;
		db: any;
	}
}
// tslint:enable
