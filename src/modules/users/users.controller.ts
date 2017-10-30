import * as _ from 'lodash';
import {
	Authorized,
	Body,
	CurrentUser,
	Get,
	JsonController,
	OnUndefined,
	Param,
	Post,
	Put,
	UnauthorizedError
} from 'routing-controllers';
import { Service } from 'typedi';
import { ExtendableError } from '../../extendable-error';
import * as UsersUtils from '../users/users.utils';
import { StatusRequest } from './kdos-status-request.models';
import { Kdo } from './kdos.models';
import { ResetPassword, User, UsersKdosCounted } from './users.models';

import { UsersService } from './users.service';

@Service()
@JsonController('/users')
export class UsersController {

	constructor(private usersService: UsersService) {
	}

	/**
	 * Sign-up a new user
	 *
	 * @param userBody
	 * @returns {Promise<User>}
	 * Sample :
	 * <pre><code>
	 *  {
	 * 	_id: '591427845bb9a818da5b3246',
	 * 	firstName: 'Bruce',
	 * 	lastName: 'Wayne',
	 * 	email: 'bruce@neo9.fr',
	 * 	createdAt: new Date().toJSON()
	 * }
	 * </code></pre>
	 */
	@Post()
	@Authorized()
	public async createUser(@Body() userBody: User): Promise<User> {
		// sanitize email to lowercase
		userBody.email = userBody.email.toLowerCase();
		// Check if user by email already exists
		const userExists = await this.usersService.getByEmail(userBody.email);
		if (userExists) {
			throw new ExtendableError('user-already-exists', 409);
		}
		// Add user to database
		const user = await this.usersService.create(userBody);
		// Send back the user created
		return _.omit(user, 'password') as any;
	}

	/**
	 * Get a user by its ID
	 *
	 * @param userId ID Mongo
	 * @param user session User
	 * @returns {Promise<User>}
	 * Sample :
	 * <pre><code>
	 *  {
	 * 	_id: '591427845bb9a818da5b3246',
	 * 	firstName: 'Bruce',
	 * 	lastName: 'Wayne',
	 * 	email: 'bruce@neo9.fr',
	 * 	createdAt: new Date().toJSON()
	 * }
	 * </code></pre>
	 */
	@Get('/:id')
	@Authorized()
	public async getUserById(@CurrentUser({required: true}) user: User, @Param('id') userId: string): Promise<User> {
		// Check if user exists
		const userRequested = await this.usersService.getById(userId, user._id, {
			historic: 0
		});
		if (!userRequested) {
			throw new ExtendableError('user-not-found', 404);
		}
		// Send back the user
		return _.omit(userRequested, 'password') as any;
	}

	@Get()
	@Authorized()
	public async getUsers(): Promise<User[]> {
		const users: UsersKdosCounted[] = await this.usersService.find({}, {password: 0, historic: 0});

		users.forEach((u) => {
			u.kdosCount = u.kdos ? u.kdos.length : 0;
			delete u.kdos;
		});

		return users;
	}

	@Post('/reset/password')
	@Authorized()
	@OnUndefined(204)
	public async resetPassword(
		@CurrentUser({required: true}) user: User,
		@Body() rstPwd: ResetPassword): Promise<void> {
		const fullUser = await this.usersService.getById(user._id, null);
		const match = await UsersUtils.verifyPassword(fullUser.password, rstPwd.oldPassword);
		if (!match) throw new ExtendableError('invalid-credentials', 401);

		await this.usersService.setPassword(user._id, rstPwd.newPassword);

		return;
	}

	@Post('/kdo')
	@Authorized()
	@OnUndefined(204)
	public async addKdo(@CurrentUser({required: true}) user: User, @Body() kdo: Kdo) {
		await this.usersService.addKdo(kdo, user._id);
		return this.usersService.getById(user._id, user._id);
	}

	@Put('/kdo/:index')
	@Authorized()
	@OnUndefined(204)
	public async editKdo(@CurrentUser({required: true}) user: User, @Body() kdo: Kdo, @Param('index') index: number) {
		await this.usersService.editKdo(kdo, user._id, index);
		return this.usersService.getById(user._id, user._id);
	}

	@Put('/:userId/kdo/:index/status')
	@Authorized()
	@OnUndefined(204)
	public async setKdoStatus(
		@CurrentUser({required: true}) user: User,
		@Param('userId') userId: string,
		@Param('index') index: number,
		@Body() status: StatusRequest) {
		if (userId === user._id) {
			throw new UnauthorizedError('user-not-valid');
		}
		await this.usersService.setKdoStatus(userId, index, status);
		return this.usersService.getById(userId, user._id);
	}
}
