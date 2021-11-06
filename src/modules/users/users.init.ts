import { N9Log } from '@neo9/n9-node-log';
import { UsersUtils } from './users.utils';

const usersCollection = global.db.collection('users');

export default async function (logger: N9Log): Promise<void> {
	const usersCount = await usersCollection.count({});

	if (usersCount === 0) {
		logger.info('Insert base user');

		await usersCollection.insertOne({
			token: '',
			email: 'test-kdonoel@yopmail.com',
			firstName: 'Admin',
			lastName: 'Admin',
			password: await UsersUtils.HASH_PASSWORD('azerty123'),
			updatedAt: new Date(),
			createdAt: new Date(),
			lastSessionAt: null,
		});

		logger.info('User init OK');
	}
}
