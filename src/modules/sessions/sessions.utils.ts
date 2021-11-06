import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { Express, NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Conf } from '../../conf/index.models';
import { TokenContent } from './sessions.models';

export class SessionsUtils {
	public static VERIFY_TOKEN(token: string, secretKey: string): boolean {
		try {
			return !!jwt.verify(token, secretKey);
		} catch (e) {
			(global.log as N9Log).error('Error while decoding JWT ', e);
			throw new N9Error((e.message || 'unknown-error').replace(/ /g, '-'), 401);
		}
	}
	public static GET_TOKEN_CONTENT(token: string, secretKey: string): TokenContent {
		try {
			return jwt.verify(token, secretKey) as TokenContent;
		} catch (e) {
			throw new N9Error('invalid-token', 401, { e });
		}
	}

	public static SET_JWT_LOADER(conf: Conf, log: N9Log, app: Express): void {
		if (conf.jwt) {
			app.use(async (req: Request, res: Response, next: NextFunction) => {
				try {
					const token = req.headers['x-jwt-token'] as string;
					if (token && typeof token === 'string') {
						if (SessionsUtils.VERIFY_TOKEN(token, conf.jwt.secret)) {
							const decodedToken = SessionsUtils.GET_TOKEN_CONTENT(token, conf.jwt.secret);
							req.headers.session = JSON.stringify(decodedToken);
							next();
						} else {
							next(new N9Error('invalid-token', 401));
						}
					} else {
						next();
					}
				} catch (e) {
					next(e);
				}
			});
		}
	}
}
