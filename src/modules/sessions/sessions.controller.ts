import { N9Error } from '@neo9/n9-node-utils';
import { Body, Inject, JsonController, N9Log, Post, Service } from 'n9-node-routing';

import { UsersService } from '../users/users.service';
import { UsersUtils } from '../users/users.utils';
import { CreateSessionBody, Session } from './sessions.models';
import { SessionsService } from './sessions.service';

@Service()
@JsonController('/sessions')
export class SessionsController {
	@Inject('logger')
	private logger: N9Log;

	constructor(private usersService: UsersService, private sessionsService: SessionsService) {}

	/**
	 * Sign-up a new user
	 *
	 * @param createSessionBody body
	 * @returns {Promise<Session>}
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
		if (!user) {
			this.logger.info(`Invalid credential due to user not found : ${email}`);
			throw new N9Error('invalid-credentials', 401);
		}

		if (!user.password) throw new N9Error('init-password-required', 401);

		const match = await UsersUtils.VERIFY_PASSWORD(user.password, password);
		if (!match) {
			this.logger.info(`Invalid credential due to wrong password for ${email}`);
			throw new N9Error('invalid-credentials', 401);
		}

		await this.usersService.updateLastSession(user._id);
		return this.sessionsService.generateUserSession(user);
	}
}
