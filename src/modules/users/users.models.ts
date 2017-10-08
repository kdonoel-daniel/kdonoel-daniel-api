import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { HistoricUser } from './historic-user.models';
import { Kdo } from './kdos.models';

export class User {
	public _id?: string;
	public token?: string;
	@IsEmail()
	public email: string;

	@MinLength(2)
	@IsNotEmpty()
	public firstName: string;

	@MinLength(2)
	@IsNotEmpty()
	public lastName: string;

	@MinLength(8)
	@Matches(/^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{8,}$/i)
	public password?: string;

	public updatedAt?: Date;

	public createdAt?: Date;

	public lastSessionAt?: Date;

	public accessToken?: string;

	public kdos?: Kdo[];

	public historic?: HistoricUser[];
}
