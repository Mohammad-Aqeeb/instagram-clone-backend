import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from './entity/tag.entity';
import { UserEntity } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { CreatePostDTO } from './dto/post.dto';
import { FilesService } from '../files/files.service';
import { PostFeedEntity } from './entity/postFeed.entity';

@Injectable()
export class PostsService {

    constructor(
        @InjectRepository(PostEntity) private postRepository : Repository<PostEntity>,
        @InjectRepository(TagEntity) private tagRepository : Repository<TagEntity>,
        @InjectRepository(PostFeedEntity) private postFeedRepository : Repository<PostFeedEntity>,

        @Inject(forwardRef(() => UserService))
        private readonly userService : UserService,

        private readonly fileService : FilesService
    ){}

    async getTags(search : string) : Promise<TagEntity[]>{
        return await this.tagRepository.createQueryBuilder('tag')
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

    async getPostById(id : number) : Promise<PostEntity>{
        return await this.postRepository.findOneOrFail({
            where : {id},
            relations : ['user', 'tag']
        })
    }

    async getTagById(id : number) : Promise<TagEntity>{
        return await this.tagRepository.createQueryBuilder('tag')
            .where('tag.id =: id', {id})
            .leftJoinAndSelect('tag.post', 'post')
            .loadRelationCountAndMap('tag.postsNumber', 'tag.posts')
            .getOneOrFail();
    }

    async getLikes(id : number, currentUserID : number): Promise<Partial<UserEntity>[]>{
        const post = await this.postRepository.findOneOrFail({
            where : {id},
            relations : ['like', 'like.user']
        });

        return await Promise.all(
            post.like.map(async(l)=>{
                return{
                    ...l.user,
                    isViewerFollowed : await this.userService.getIsUserFollowed(currentUserID, l.user.id)
                }
            })
        )
    }

    async getTagByName(name : string) : Promise<TagEntity>{
        return await this.tagRepository.createQueryBuilder('tag')
            .where('tag.name =: name', {name})
            .loadRelationCountAndMap('tag.postNumber', 'tag.post')
            .getOneOrFail()
    }

    async createPost(file : Express.Multer.File, payload : CreatePostDTO,id : number) : Promise<PostEntity> {
        const user = await this.userService.getByID(id);

        const uploadedFile = await this.fileService.uploadFile({
            file,
            quality : 95,
            imageMaxSizeMB : 20,
            type : 'image'
        })

        const post = await this.postRepository.save({
            description : payload.description,
            file :uploadedFile,
            user
        })

        try{
            const parseTag = JSON.parse(payload.tags);
            const formattedTag = await Promise.all(
                parseTag.map(async (tag)=>{
                const dbTag = await this.tagRepository.findOne({where : {name : tag}})
                if(!dbTag){
                    const tagEntity = await this.tagRepository.save({ name: tag });
                    return tagEntity
                }
                else{
                    return dbTag
                }
            }))

            const savedPost = await this.postRepository.save({
                ...post,
                tags : formattedTag
            })

            const userFollowers = await this.userService.getUserFollower(id);

            await Promise.all(
                userFollowers.map(async(follower)=>{
                    await this.postFeedRepository.save({
                        user : follower,
                        post : savedPost
                    })
                })
            )
        }
        catch(error){
            console.log(error)
        }
        return post
    }

    async deletePost(id : number) : Promise<void>{
        this.postRepository.delete(id);
    }
}
