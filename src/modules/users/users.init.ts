import { hashPassword } from './users.utils';

const usersCollection = global.db.collection('users');

export default async function() {
	const users = await    usersCollection.find({
		email: 'test-kdonoel@yopmail.com'
	}).toArray();

	if (users.length === 0) {
		global.log.module('user init').info('Insert base user');

		usersCollection.insertOne({
			token: '',
			email: 'test-kdonoel@yopmail.com',
			firstName: 'Admin',
			lastName: 'Admin',
			password: await hashPassword('azerty123'),
			updatedAt: new Date(),
			createdAt: new Date(),
			lastSessionAt: null,
		}).then(() => {
			global.log.module('user init').info('User init OK');
		}).catch((error) => {
			global.log.module('user init').error(`User init KO ${error}`);
		});
	}
}
