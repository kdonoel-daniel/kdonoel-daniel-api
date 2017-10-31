import { MongoClient, ObjectID } from 'mongodb';

const {mongo} = global.conf;
const log = global.log.module('mongo');

export const connect = async () => {
	log.info(`Connecting to ${mongo.url}...`);
	global.db = await MongoClient.connect(mongo.url);
	log.info(`Connected`);
};

export const oid = (id: string) => id ? new ObjectID(id) : id;

export async function setIdMongoToStringAsync<T extends { _id: ObjectID | string }>(promise: Promise<T>): Promise<T> {
	const object = await promise;
	if (object && object._id) {
		if (typeof object._id !== 'string') {
			object._id = object._id.toHexString();
		}
	}
	return object;
}

export function setIdMongoToStringSync<T extends { _id: ObjectID | string }>(object: T): T {
	if (object && object._id) {
		if (typeof object._id !== 'string') {
			object._id = object._id.toHexString();
		}
	}
	return object;
}
