import { Injectable } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {

    constructor(@InjectRepository(PostEntity) PostEntity : Repository<PostEntity>){}

    async 
}
