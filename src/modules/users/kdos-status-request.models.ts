import { IsEnum, IsNotEmpty } from 'class-validator';
import { KdoState } from './kdos.models';

export class StatusRequest {
	@IsNotEmpty()
	@IsEnum(KdoState)
	public status: KdoState;
}
