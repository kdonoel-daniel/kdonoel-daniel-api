import { MongoClient, StringMap } from '@neo9/n9-mongo-client';
import { N9Error } from '@neo9/n9-node-utils';
import { Cursor, FilterQuery } from 'mongodb';
import { Service } from 'n9-node-routing';
import { TokenContent } from '../sessions/sessions.models';
import { StatusRequest as StatusRequestUpdate } from './kdos-status-request.models';
import { Kdo, KdoRequestUpdate, KdoState } from './kdos.models';
import { PasswordInitRequest, UserEntity, UserListItem } from './users.models';
import { UsersUtils } from './users.utils';

@Service()
export class UsersService {
	private mongoClient: MongoClient<UserEntity, UserEntity>;

	constructor() {
		this.mongoClient = new MongoClient('users', UserEntity, UserListItem, {
			keepHistoric: true,
		});
	}

	public async create(user: UserEntity): Promise<UserEntity> {
		user.password = await UsersUtils.HASH_PASSWORD(user.password);
		return await this.mongoClient.insertOne(user, 'none');
	}

	public async getById(
		userId: string,
		userIdFor?: string,
		projection: StringMap<number> = {},
	): Promise<UserEntity> {
		if (userIdFor && userId === userIdFor) {
			projection['kdos.status'] = 0;
		}
		const user = await this.mongoClient.findOneById(userId, projection);
		if (!user) {
			throw new N9Error('user-not-found', 404, { id: userId });
		}
		return user;
	}

	public async existsById(userId: string): Promise<void> {
		const user = await this.mongoClient.existsById(userId);
		if (!user) {
			throw new N9Error('user-not-found', 404, { id: userId });
		}
	}

	public async getByEmail(email: string, projection?: object): Promise<UserEntity> {
		return await this.mongoClient.findOneByKey(email, 'email', projection);
	}

	public async find(
		query: FilterQuery<UserEntity>,
		projection: object = {},
	): Promise<Cursor<UserEntity>> {
		return await this.mongoClient.find(query, 0, 0, { firstName: 1, lastName: 1 }, projection);
	}

	public async setPassword(userId: string, pwd: string, editor: TokenContent): Promise<void> {
		const user = await this.getById(userId);
		user.password = await UsersUtils.HASH_PASSWORD(pwd);
		await this.updateById(userId, user, editor.userId);
	}

	public async updateLastSession(userId: string): Promise<void> {
		const user = await this.getById(userId);
		user.lastSessionAt = new Date();
		await this.updateById(userId, user, userId);
	}

	public async addKdo(kdo: Kdo, userId: string, editor: TokenContent): Promise<UserEntity> {
		const userToUpate = await this.getById(userId);

		if (!userToUpate.kdos) {
			userToUpate.kdos = [];
		}

		userToUpate.kdos.push({
			...kdo,
			status: {
				code: KdoState.FREE,
			},
		});

		return await this.updateById(userId, userToUpate, editor.userId);
	}

	public async editKdo(
		kdoRequestUpdate: KdoRequestUpdate,
		userId: string,
		index: number,
		editor: TokenContent,
	): Promise<void> {
		const userToUpdate = await this.getById(userId);

		userToUpdate.kdos[index] = {
			...userToUpdate.kdos[index],
			...kdoRequestUpdate,
		};

		await this.updateById(userId, userToUpdate, editor.userId);
	}

	public async setKdoStatus(
		userId: string,
		index: number,
		statusRequestUpdate: StatusRequestUpdate,
		editor: TokenContent,
	): Promise<void> {
		const userToUpate = await this.getById(userId);

		if (
			userToUpate.kdos[index].status?.userId &&
			userToUpate.kdos[index].status?.userId !== editor.userId
		) {
			throw new N9Error('can-t-update-status', 401);
		}
		userToUpate.kdos[index] = {
			...userToUpate.kdos[index],
			status: {
				code: statusRequestUpdate.status,
				userId: editor.userId,
				lastUpdateDate: new Date(),
			},
		};

		await this.updateById(userId, userToUpate, editor.userId);
	}

	public async initPassword(passwordInitRequest: PasswordInitRequest): Promise<UserEntity> {
		const user = await this.getByEmail(passwordInitRequest.email);
		if (!user) throw new N9Error('user-not-found', 404);
		if (user.password) throw new N9Error('password-already-set', 401);

		return await this.updateById(
			user._id,
			{
				...user,
				password: await UsersUtils.HASH_PASSWORD(passwordInitRequest.pwd),
			},
			user._id,
		);
	}

	private async updateById(
		userId: string,
		user: UserEntity,
		editorId: string,
	): Promise<UserEntity> {
		return await this.mongoClient.findOneAndUpdateByIdWithLocks(
			userId,
			user,
			editorId,
			false,
			true,
		);
	}
}
