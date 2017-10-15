import { IsNotEmpty } from 'class-validator';
import { KdoState } from './kdos.models';

export class StatusRequest {
	@IsNotEmpty()
	public status: KdoState;
}
