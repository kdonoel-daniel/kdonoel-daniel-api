
export class Post {

	public id: number;
	public title: string;
	public text: string;
	public createDate: Date = new Date();

	constructor(id: number, title: string, text: string) {
		this.id = id;
		this.title = title;
		this.text = text;
	}
}
