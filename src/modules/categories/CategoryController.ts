import { Authorized, Body, Delete, Get, JsonController, Param, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { Category } from './Category';
import { CategoryRepository } from './CategoryRepository';

@Service()
@JsonController()
export class CategoryController {

	constructor(private categoryRepository: CategoryRepository) {
	}

	@Get('/categories')
	public all(): Promise<Category[]> {
		return this.categoryRepository.findAll();
	}

	@Get('/categories/:id')
	public one(@Param('id') id: number): Category {
		return this.categoryRepository.findOne(id);
	}

	@Post('/categories')
	public category(@Body() category: Category): Category {
		return this.categoryRepository.save(category);
	}

	@Authorized()
	@Delete('/categories/:id')
	public delete(@Param('id') id: number): Category {
		return this.categoryRepository.remove(id);
	}
}
