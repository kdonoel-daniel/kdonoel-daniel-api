import { hashPassword } from './users.utils';

const usersCollection = global.db.collection('users');

usersCollection.insertOne({
	token: '',
	email: 'test-kdonoel@yopmail.com',
	firstName: 'Admin',
	lastName: 'Admin',
	password: hashPassword('azerty'),
	updatedAt: new Date(),
	createdAt: new Date(),
	lastSessionAt: null,
});
