import { IsNotEmpty } from 'class-validator';

export class Kdo {

	@IsNotEmpty()
	public title: string;

	public description?: string;
	public status?: KdoState;
	public historic?: object[];
}

export type KdoState = 'FREE' | 'RESERVED' | 'BOUGHT';
