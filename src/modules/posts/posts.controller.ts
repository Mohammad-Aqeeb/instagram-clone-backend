import { Body, Controller, Get, Param, Post, Query, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostEntity } from './entity/post.entity';
import { TagEntity } from './entity/tag.entity';
import { CommentEntity } from './entity/comment.entity';
import { PostLikeEntity } from './entity/postLike.entity';
import { UserEntity } from '../user/entity/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDTO } from './dto/post.dto';

@Controller('posts')
export class PostsController {

    constructor(private readonly postService : PostsService){}

    @Get('tags')
    async getTags(@Query('search') search : string) : Promise<TagEntity[]>{
        return await this.postService.getTags(search);
    }

    @Get(':id')
    async getPostById(@Param('id') id : number) : Promise<PostEntity>{
        return await this.postService.getPostById(id)
    }

    // @Get('comments/:id')
    // async getComments(@Param('id') id:string, @Request() req) : Promise<CommentEntity>{
    //     return await this.postService.getComments(id)
    // }

    @Get('likes/:id')
    async getLikes(@Param('id') id:number, @Request() req) : Promise<Partial<UserEntity>[]>{
        return await this.postService.getLikes(id,req.user.id);
    }

    @Get('tags/:name')
    async getTagByName(@Param('name') name : string) : Promise<TagEntity>{
        return await this.postService.getTagByName(name);
    }

    @UseInterceptors(FileInterceptor('file'))
    @Post()
    async createPost(
        @UploadedFile() file : Express.Multer.File,
        @Body() payload : CreatePostDTO,
        @Request() req
    ) : Promise<PostEntity>{
        return this.postService.createPost(file, payload, req.user.id)
    }
}
