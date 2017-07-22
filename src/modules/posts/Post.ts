import { Category } from '../categories/Category';

export class Post {

	public id: number;
	public title: string;
	public text: string;
	public createDate: Date = new Date();
	public categories: Category[];

	constructor(id: number, title: string, text: string, categories: Category[]) {
		this.id = id;
		this.title = title;
		this.text = text;
		this.categories = categories;
	}
}
