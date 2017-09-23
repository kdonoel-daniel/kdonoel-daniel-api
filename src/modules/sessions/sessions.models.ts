import { IsEmail, Matches, MinLength } from 'class-validator';
import { User } from '../users/users.models';

export class CreateSessionBody {

	@IsEmail()
	public email: string;

	@MinLength(8)
	@Matches(/^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{8,}$/i)
	public password?: string;
}

export interface Session {
	token: string;
	profile: User;
}

export interface TokenDetails {
	_id: string;
	email: string;
	firstName: string;
	lastName: string;
}
