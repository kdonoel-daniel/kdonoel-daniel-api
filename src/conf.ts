import * as _ from 'lodash';

import Log from './logs';

export const env: string = process.env.NODE_ENV || 'development';
const confPath: string = process.env.NODE_CONF ? `${process.env.NODE_CONF}/kdos-noel/` : './conf/';
const log = Log('kdos-noel').module('conf');

const files = [
	'./conf/application',
	`${confPath}${env}`
];
try {
	require('./conf/local');
	files.push('./conf/local');
} catch (e) {
	// local config is not found
}

const sources: Conf[] = [];

files.forEach((name) => {
	log.info(`Loading ${name.split('/').slice(-1)} configuration`);
	sources.push(require(name).default);
});

sources.push({
	env,
	name: 'kdos-noel',
	version: '1.0.0'
});

function customizer(objValue: any, srcValue: any): any {
	if (_.isArray(objValue) && _.isArray(srcValue)) return srcValue;
	if (_.isRegExp(objValue) || _.isRegExp(srcValue)) return srcValue;
	if (_.isObject(objValue) || _.isObject(srcValue)) return _.mergeWith(objValue, srcValue, customizer);
}

export default _.mergeWith.apply(null, [...sources, customizer]);
