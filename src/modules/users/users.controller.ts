import * as _ from 'lodash';
import {
	Authorized,
	Body,
	CurrentUser,
	Get,
	JsonController,
	N9Error,
	Param,
	Post,
	Put,
	QueryParam,
	Service,
} from 'n9-node-routing';

import { Session, TokenContent } from '../sessions/sessions.models';
import { SessionsService } from '../sessions/sessions.service';
import { KdoRequestCreate, KdoRequestUpdate } from './kdos.models';
import { StatusRequest } from './kdos-status-request.models';
import {
	PasswordInitRequest,
	PasswordResetRequest,
	UserEntity,
	UserListItem,
	UserRequestCreate,
} from './users.models';
import { UsersService } from './users.service';
import { UsersUtils } from './users.utils';

@Service()
@JsonController('/users')
export class UsersController {
	constructor(private usersService: UsersService, private sessionsService: SessionsService) {}

	/**
	 * Sign-up a new user
	 *
	 * @param userBody
	 * @returns {Promise<UserEntity>}
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
	public async createUser(@Body() userBody: UserRequestCreate): Promise<UserEntity> {
		// sanitize email to lowercase
		userBody.email = userBody.email.toLowerCase();
		// Check if user by email already exists
		const userExists = await this.usersService.getByEmail(userBody.email);
		if (userExists) {
			throw new N9Error('user-already-exists', 409, { email: userBody.email });
		}
		// Add user to database
		const user = await this.usersService.create(userBody);
		// Send back the user created
		return _.omit(user, 'password') as any;
	}

	/**
	 * Get a user by its ID
	 *
	 * @param tokenContent session User
	 * @param userId ID Mongo
	 * @returns {Promise<UserEntity>}
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
	@Get('/:id([0-9a-f]{24})')
	@Authorized()
	public async getUserById(
		@CurrentUser({ required: true }) tokenContent: TokenContent,
		@Param('id') userId: string,
	): Promise<UserEntity> {
		// Check if user exists
		const userRequested = await this.usersService.getById(userId, tokenContent.userId);
		if (!userRequested) {
			throw new N9Error('user-not-found', 404);
		}
		await this.usersService.existsById(tokenContent.userId);
		const isItself = userId === tokenContent.userId;

		userRequested.kdos = userRequested.kdos?.filter((k) => (isItself ? !k.isSurprise : true));

		// Send back the user
		return _.omit(userRequested, 'password') as any;
	}

	@Post('/:userId([0-9a-f]{24})/kdos')
	@Authorized()
	public async addKdoToUser(
		@CurrentUser({ required: true }) tokenContent: TokenContent,
		@Body() kdo: KdoRequestCreate,
		@Param('userId') userId: string,
	): Promise<UserEntity> {
		await this.usersService.existsById(tokenContent.userId);
		return await this.usersService.addKdo(kdo, userId, tokenContent);
	}

	@Put('/:userId([0-9a-f]{24})/kdos/:index')
	@Authorized()
	public async editKdo(
		@CurrentUser({ required: true }) tokenContent: TokenContent,
		@Body() kdo: KdoRequestUpdate,
		@Param('index') index: number,
		@Param('userId') userId: string,
	): Promise<UserEntity> {
		await this.usersService.existsById(tokenContent.userId);
		await this.usersService.editKdo(kdo, userId, index, tokenContent);
		return await this.usersService.getById(userId, tokenContent.userId);
	}

	@Get()
	@Authorized()
	public async getUsers(
		@CurrentUser({ required: true }) tokenContent: TokenContent,
		@QueryParam('family-code', { required: true }) familyCode: string,
	): Promise<UserListItem[]> {
		const fullUser = await this.usersService.getById(tokenContent.userId, null);
		if (!fullUser.familyCodes?.includes(familyCode)) {
			throw new N9Error('wrong-family', 400, { familyCode });
		}
		const users: UserEntity[] = await this.usersService
			.find(
				{
					familyCodes: familyCode,
				},
				{ password: 0, historic: 0 },
			)
			.toArray();

		return users.map((u): UserListItem => {
			const isItself = u._id === tokenContent.userId;

			return {
				_id: u._id,
				email: u.email,
				firstName: u.firstName,
				lastName: u.lastName,
				kdosCount: u.kdos ? u.kdos.filter((k) => (isItself ? !k.isSurprise : true)).length : 0,
				objectInfos: u.objectInfos,
				lastSessionAt: u.lastSessionAt,
				familyCodes: undefined,
			};
		});
	}

	@Post('/reset/password')
	@Authorized()
	public async resetPassword(
		@CurrentUser({ required: true }) user: TokenContent,
		@Body() passwordResetRequest: PasswordResetRequest,
	): Promise<void> {
		const fullUser = await this.usersService.getById(user.userId, null);
		const match = await UsersUtils.VERIFY_PASSWORD(
			fullUser.password,
			passwordResetRequest.oldPassword,
		);
		if (!match) throw new N9Error('invalid-credentials', 401);

		await this.usersService.setPassword(user.userId, passwordResetRequest.newPassword, user);
	}

	@Put('/:userId([0-9a-f]{24})/kdos/:index([0-9]+)/status')
	@Authorized()
	public async setKdoStatus(
		@CurrentUser({ required: true }) tokenContent: TokenContent,
		@Param('userId') userId: string,
		@Param('index') index: number,
		@Body() status: StatusRequest,
	): Promise<UserEntity> {
		if (userId === tokenContent.userId) {
			throw new N9Error('user-not-valid', 401);
		}
		await this.usersService.existsById(tokenContent.userId);

		await this.usersService.setKdoStatus(userId, index, status, tokenContent);
		return this.usersService.getById(userId, tokenContent.userId);
	}

	@Post('/init/password')
	public async initPassword(@Body() passwordInitRequest: PasswordInitRequest): Promise<Session> {
		const user = await this.usersService.initPassword(passwordInitRequest);

		await this.usersService.updateLastSession(user._id);
		return this.sessionsService.generateUserSession(user);
	}
}
