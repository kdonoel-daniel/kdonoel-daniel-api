import { HttpError } from 'routing-controllers';
export class ExtendableError extends HttpError {
	public status: number;
	public context: any;

	constructor(message: string, status: number, context?: any) {
		super(status, message);
		this.message = message;
		this.status = status || 500;
		this.context = context || {};
		Error.captureStackTrace(this, ExtendableError);
	}
}
