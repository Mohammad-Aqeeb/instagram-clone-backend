import { Controller, Get, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostEntity } from './entity/post.entity';
import { TagEntity } from './entity/tag.entity';

@Controller('posts')
export class PostsController {

    constructor(private readonly postService : PostsService){}

    @Get('tags')
    async getByTag(@Query('search') search : string) : Promise<TagEntity[]>{
        return this.postService.getByTag(search);
    }
}
