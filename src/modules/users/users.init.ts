import { N9Log } from '@neo9/n9-node-log';
import { UsersUtils } from './users.utils';

const usersCollection = global.db.collection('users');

export default async function (logger: N9Log): Promise<void> {
	const usersCount = await usersCollection.count({});

	if (usersCount === 0) {
		logger.info('Insert base user');

		await usersCollection.insertOne({
			email: 'test-kdonoel@yopmail.com',
			firstName: 'Admin',
			lastName: 'Admin',
			password: await UsersUtils.HASH_PASSWORD('azerty123'),
			familyCodes: ['Daniel', 'Chaboud'],
		});

		await usersCollection.insertOne({
			email: 'test-kdonoel2@yopmail.com',
			firstName: 'User2',
			lastName: 'Last Name',
			password: await UsersUtils.HASH_PASSWORD('azerty123'),
			familyCodes: ['Daniel'],
		});

		logger.info('User init OK');
	}
	await usersCollection.createIndex({ email: 1 }, { unique: true });
}
