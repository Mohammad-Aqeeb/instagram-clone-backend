import { Injectable } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from './entity/tag.entity';

@Injectable()
export class PostsService {

    constructor(
        @InjectRepository(PostEntity) private postRepository : Repository<PostEntity>,
        @InjectRepository(TagEntity) private tagRepository : Repository<TagEntity>
    ){}

    async getByTag(search : string) : Promise<TagEntity[]>{
        return this.tagRepository.createQueryBuilder('tag')
            .select('tag')
            .from(TagEntity, 'tag')
            .leftJoin('tag.posts', 'posts')
            .addSelect('Count(posts)', 'count')
            .where('tag.name ILIKE search' , {search : `%${search}%`})
            .orderBy('count', 'DESC')
            .groupBy('tag.id')
            .take(20)
            .getMany();

    }
}
