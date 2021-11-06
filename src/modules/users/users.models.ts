import { BaseMongoObject } from '@neo9/n9-mongo-client';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Exclude, Expose } from 'n9-node-routing';
import { Kdo } from './kdos.models';

@Exclude()
export class UserRequestCreate {
	@IsEmail()
	@Expose()
	public email: string;
	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@Expose()
	public firstName: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@Expose()
	public lastName: string;
}

export class UserEntity extends BaseMongoObject {
	public token?: string;
	public email: string;
	public firstName: string;
	public lastName: string;
	public password?: string;
	public lastSessionAt?: Date;
	public accessToken?: string;
	public kdos?: Kdo[];
}

export class UserListItem extends BaseMongoObject {
	public token?: string;
	public email: string;
	public firstName: string;
	public lastName: string;
	public lastSessionAt?: Date;
	public kdosCount?: number;
}

export class PasswordResetRequest {
	public oldPassword: string;
	public newPassword: string;
}
