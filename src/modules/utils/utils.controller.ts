import { Get, JsonController } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController()
export class UsersController {

	@Get('/ping')
	public ping(): string {
		return 'pong';
	}
}
