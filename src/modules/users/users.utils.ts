import * as bcrypt from 'bcrypt';

export class UsersUtils {
	public static async HASH_PASSWORD(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(10);

		return await bcrypt.hash(password, salt);
	}

	public static async VERIFY_PASSWORD(password: string, candidate: string): Promise<boolean> {
		return await bcrypt.compare(candidate, password);
	}
}
