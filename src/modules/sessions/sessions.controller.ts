import { Body, JsonController, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { ExtendableError } from '../../extendable-error';
import { User } from '../users/users.models';

import { UsersService } from '../users/users.service';
import * as UsersUtils from '../users/users.utils';
import { CreateSessionBody, Session } from './sessions.models';
import { SessionsService } from './sessions.service';

@Service()
@JsonController('/sessions')
export class UsersController {

	constructor(
		private usersService: UsersService,
		private sessionsService: SessionsService) {
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
	public async createSession(@Body() createSessionBody: CreateSessionBody): Promise<Session> {
		const email = createSessionBody.email;
		const password = createSessionBody.password;

		const user = await this.usersService.findOne({email}, {});
		if (!user) throw new ExtendableError('invalid-credentials', 401);

		const match = await UsersUtils.verifyPassword(user.password, password);

		if (!match) throw new ExtendableError('invalid-credentials', 401);
		return await this.sessionsService.generateUserSession(user);
	}

}
