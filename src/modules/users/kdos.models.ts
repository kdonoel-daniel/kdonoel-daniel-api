import { IsNotEmpty } from 'class-validator';

export class Kdo {

	@IsNotEmpty()
	public title: string;

	public description?: string;
	public status?: 'reserved' | 'bought';
	public historic?: object[];
}
