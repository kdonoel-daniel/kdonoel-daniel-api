import * as  jwt from 'jsonwebtoken';
import { Collection, Db } from 'mongodb';
import { Service } from 'typedi';
import { User } from '../users/users.models';
import { Session, TokenDetails } from './sessions.models';

@Service()
export class SessionsService {
	private db: Db = global.db;
	private users: Collection = this.db.collection('users');

	private TOKEN_EXPIRATION_TIME = 60 * 24 * 30 * 60;

	public async generateUserSession(user: User): Promise<Session> {
		return await {
			token: this.generateAccessToken({
				_id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			}),
			profile: {
				_id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName
			}
		};

	}

	private generateAccessToken(session: TokenDetails): string {
		return jwt.sign(session, global.conf.jwt.secret, {expiresIn: this.TOKEN_EXPIRATION_TIME});
	}
}
