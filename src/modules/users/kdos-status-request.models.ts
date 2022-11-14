import { IsEnum, IsNotEmpty } from 'n9-node-routing';

import { KdoState } from './kdos.models';

export class StatusRequest {
	@IsNotEmpty()
	@IsEnum(KdoState)
	public status: KdoState;
}
