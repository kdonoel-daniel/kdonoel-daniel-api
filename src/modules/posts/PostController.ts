import { Body, Delete, Get, JsonController, Param, Post as HttpPost } from 'routing-controllers';
import { Service } from 'typedi';
import { Post } from './Post';
import { PostRepository } from './PostRepository';

@Service()
@JsonController()
export class PostController {

	constructor(private postRepository: PostRepository) {
	}

	@Get('/posts')
	public all(): Promise<Post[]> {
		return this.postRepository.findAll();
	}

	@Get('/posts/:id')
	public one(@Param('id') id: number): Post {
		return this.postRepository.findOne(id);
	}

	@HttpPost('/posts')
	public post(@Body() post: Post): Post {
		return this.postRepository.save(post);
	}

	@Delete('/posts/:id')
	public delete(@Param('id') id: number): Post {
		return this.postRepository.remove(id);
	}
}
