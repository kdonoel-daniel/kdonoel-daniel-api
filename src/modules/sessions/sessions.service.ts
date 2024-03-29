import * as jwt from 'jsonwebtoken';
import { Service } from 'n9-node-routing';

import { UserEntity } from '../users/users.models';
import { Session, TokenContent } from './sessions.models';

@Service()
export class SessionsService {
	private static generateAccessToken(session: TokenContent): string {
		const conf = global.conf;
		return jwt.sign(session, conf.jwt.secret, {
			expiresIn: conf.jwt.expiresIn,
		});
	}

	public generateUserSession(user: UserEntity): Session {
		return {
			token: SessionsService.generateAccessToken({
				userId: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				familyCodes: user.familyCodes,
			}),
			profile: {
				_id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				familyCodes: user.familyCodes,
			},
		};
	}
}
