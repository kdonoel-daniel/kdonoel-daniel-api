import { Collection, Db, FindOneOptions } from 'mongodb';
import { Service } from 'typedi';

import { oid, setIdMongoToStringAsync, setIdMongoToStringSync } from '../../mongo';
import { Kdo } from './kdos.models';
import { User } from './users.models';
import { hashPassword } from './users.utils';

@Service()
export class UsersService {
	private db: Db = global.db;
	private users: Collection = this.db.collection('users');

	public async create(user: User): Promise<User> {
		// Hash password
		user.password = await hashPassword(user.password);
		// Add date creation
		user.createdAt = new Date();
		// Save to database
		await this.users.insertOne(user);
		// Send back user
		return user;
	}

	public async getById(userId: string): Promise<User> {
		return await this.findOne({_id: oid(userId)});
	}

	public async getByEmail(email: string): Promise<User> {
		return await this.findOne({email});
	}

	public async findOne(query: object, options?: FindOneOptions): Promise<User> {
		return await setIdMongoToStringAsync(this.users.findOne(query, options));
	}

	public async find(query: object, projection: object = {}): Promise<User[]> {
		return (await this.users.find(query).project(projection).toArray()).map((e) => setIdMongoToStringSync(e));
	}

	public async updatebyId(userId: string, user: User): Promise<void> {
		// Add/Update updateAt property
		user.updatedAt = new Date();
		// Find and update the user
		await this.users.findOneAndUpdate(
			{_id: oid(userId)},
			{$set: user},
			{returnOriginal: false}
		);
	}

	public async addKdo(kdo: Kdo, userId: string): Promise<void> {
		await this.users.updateOne({
			_id: oid(userId)
		}, {
			$push: {
				kdos: kdo
			}
		});
	}
}
