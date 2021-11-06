import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { Conf } from '../../conf/index.models';
import { UserEntity } from '../users/users.models';
import { Session, TokenContent } from './sessions.models';

@Service()
export class SessionsService {
	public async generateUserSession(user: UserEntity): Promise<Session> {
		return await {
			token: this.generateAccessToken({
				userId: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			}),
			profile: {
				_id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			},
		};
	}

	private generateAccessToken(session: TokenContent): string {
		const conf = global.conf as Conf;
		return jwt.sign(session, conf.jwt.secret, {
			expiresIn: conf.jwt.expiresIn,
		});
	}
}
