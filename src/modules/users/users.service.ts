import * as _ from 'lodash';
import { Collection, Db } from 'mongodb';
import { Service } from 'typedi';

import { oid, setIdMongoToStringAsync, setIdMongoToStringSync } from '../../mongo';
import { ObjectUtilsService } from '../utils/object-utils.service';
import { Kdo } from './kdos.models';
import { User } from './users.models';
import { hashPassword } from './users.utils';

@Service()
export class UsersService {
	private db: Db = global.db;
	private users: Collection = this.db.collection('users');

	constructor(private objectUtilsService: ObjectUtilsService) {
	}

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

	public async getById(userId: string, projection?: object): Promise<User> {
		return await this.findOne({_id: oid(userId)}, projection);
	}

	public async getByEmail(email: string, projection?: object): Promise<User> {
		return await this.findOne({email}, projection);
	}

	public async findOne(query: object, projection?: object): Promise<User> {
		if (!projection) {
			projection = {};
		}
		return await setIdMongoToStringAsync(this.users.findOne(query, {
			fields: projection
		}));
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
		kdo = this.objectUtilsService.removeEmpty(kdo) as Kdo;
		const existingUser = await this.getById(userId);

		const newUser = _.cloneDeep(existingUser);
		newUser.kdos.push(kdo);
		const diff = this.objectUtilsService.getRightDiffs(existingUser, newUser);

		await this.users.updateOne({
			_id: oid(userId)
		}, {
			$push: {
				kdos: kdo,
				historic: {
					updatedAt: new Date(),
					idUser: oid(userId),
					type: 'create-kdo',
					dataEdited: diff
				}
			}
		});
	}

	public async editKdo(kdo: Kdo, userId: string, index: number): Promise<void> {
		kdo = this.objectUtilsService.removeEmpty(kdo) as Kdo;
		const set = {};
		set['kdos.' + index] = kdo;

		const existingUser = await this.getById(userId);
		const diff = this.objectUtilsService.getRightDiffs(existingUser.kdos[index], kdo);

		await this.users.updateOne({
			_id: oid(userId)
		}, {
			$set: set,
			$push: {
				historic: {
					updatedAt: new Date(),
					idUser: oid(userId),
					type: 'edit-kdo',
					dataEdited: diff
				}
			}
		});
	}
}
