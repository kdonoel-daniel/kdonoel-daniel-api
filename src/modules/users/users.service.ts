import * as _ from 'lodash';
import { Collection, Db } from 'mongodb';
import { Service } from 'typedi';

import { oid, setIdMongoToStringAsync, setIdMongoToStringSync } from '../../mongo';
import { ObjectUtilsService } from '../utils/object-utils.service';
import { StatusRequest } from './kdos-status-request.models';
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

	public async getById(userId: string, userIdFor: string, projection?: object): Promise<User> {
		if (userId === userIdFor) {
			if (!projection) {
				projection = {};
			}
			projection = Object.assign(projection, {
				'kdos.status': 0
			});
		}
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
		return (await this.users.find(query).project(projection).sort({
			firstName: 1	
		}).toArray()).map((e) => setIdMongoToStringSync(e));
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

	public async setPassword(userId: string, pwd: string): Promise<void> {
		const user = await this.getById(userId, null);
		user.password = await hashPassword(pwd);
		delete user._id;
		await this.updatebyId(userId, user);
	}

	public async addKdo(kdo: Kdo, userId: string): Promise<void> {
		kdo = this.objectUtilsService.removeEmpty(kdo) as Kdo;
		const existingUser = await this.getById(userId, null);

		const newUser = _.cloneDeep(existingUser);
		if (!newUser.kdos) {
			newUser.kdos = [];
		}
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

		const existingUser = await this.getById(userId, null);

		set['kdos.' + index] = Object.assign({}, existingUser.kdos[index], kdo);

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

	public async setKdoStatus(userId: string, index: number, status: StatusRequest): Promise<void> {
		const set = {};
		const existingUser = await this.getById(userId, null);

		const newKdo = _.cloneDeep(existingUser.kdos[index]);
		newKdo.status = status.status;
		set['kdos.' + index] = newKdo;

		const diff = this.objectUtilsService.getRightDiffs(existingUser.kdos[index], newKdo);

		await this.users.updateOne({
			_id: oid(userId)
		}, {
			$set: set,
			$push: {
				historic: {
					updatedAt: new Date(),
					idUser: oid(userId),
					type: 'edit-kdo-status',
					dataEdited: diff
				}
			}
		});
	}
}
