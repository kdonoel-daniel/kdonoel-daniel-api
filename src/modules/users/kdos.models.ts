import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export enum KdoState {
	'FREE' = 'free',
	'RESERVED' = 'reserved',
	'BOUGHT' = 'bought',
}

export class KdoStatus {
	@IsEnum(KdoState)
	public code: KdoState;

	@IsString()
	public userId?: string;

	public lastUpdateDate?: Date;
}

export class Kdo {
	@IsNotEmpty()
	public title: string;

	@IsString()
	@IsOptional()
	public description?: string;

	@ValidateNested()
	public status?: KdoStatus;
}

export class KdoRequestCreate {
	@IsNotEmpty()
	public title: string;

	@IsString()
	@IsOptional()
	public description?: string;
}
