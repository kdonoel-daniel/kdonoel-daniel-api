import { IsEmail, Matches, MinLength } from 'class-validator';
import { UserEntity } from '../users/users.models';

export class CreateSessionBody {
	@IsEmail()
	public email: string;

	@MinLength(8)
	@Matches(/^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{8,}$/i)
	public password?: string;
}

export interface Session {
	token: string;
	profile: UserEntity;
}

export interface TokenContent {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
}
