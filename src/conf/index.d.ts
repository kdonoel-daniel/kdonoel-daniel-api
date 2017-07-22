interface Conf {
	http?: {
		port: number
	};
	log?: {
		level: 'info' | 'warn' | 'error'
		http: 'dev' | 'common' | 'combined' | 'short' | 'tiny'
	};
	mongo?: {
		url: string
	};
	io?: {
		enabled: boolean
	};
	jwt?: {
		secret: string,
		expiresIn: string | number
	};
	env?: string;
	name?: string;
	version?: string;
}
