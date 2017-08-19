import * as _ from 'lodash';
import { Body, Get, JsonController, Param, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { ExtendableError } from '../../extendable-error';
import { User } from './users.models';

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
	public async getUserById(@Param('id') userId: string): Promise<User> {
		// Check if user exists
		const user = await this.usersService.getById(userId);
		if (!user) {
			throw new ExtendableError('user-not-found', 404);
		}
		// Send back the user
		return _.omit(user, 'password') as any;
	}

	@Get()
	public async getUsers(): Promise<User[]> {
		return this.usersService.find({});
	}
}
