import * as bcrypt from 'bcrypt';

export class UsersUtils {
	public static async HASH_PASSWORD(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	public static async VERIFY_PASSWORD(passwordHashed: string, candidate: string): Promise<boolean> {
		return await bcrypt.compare(candidate, passwordHashed);
	}
}
