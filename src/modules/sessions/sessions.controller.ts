import { N9Error } from '@neo9/n9-node-utils';
import { Body, JsonController, Post } from 'n9-node-routing';
import { Service } from 'typedi';
import { UsersService } from '../users/users.service';
import { UsersUtils } from '../users/users.utils';
import { CreateSessionBody, Session } from './sessions.models';
import { SessionsService } from './sessions.service';

@Service()
@JsonController('/sessions')
export class SessionsController {
	constructor(private usersService: UsersService, private sessionsService: SessionsService) {}

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

		const user = await this.usersService.getByEmail(email, { kdos: 0 });
		if (!user) throw new N9Error('invalid-credentials', 401);

		const match = await UsersUtils.VERIFY_PASSWORD(user.password, password);
		if (!match) throw new N9Error('invalid-credentials', 401);

		// TODO: add last session update
		await this.usersService.updateLastSession(user._id);
		return await this.sessionsService.generateUserSession(user);
	}
}
