import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { DataSource, getManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from './entity/tag.entity';
import { UserEntity } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { CreateCommentDTO, CreatePostDTO, UpdatePostDTO } from './dto/post.dto';
import { FilesService } from '../files/files.service';
import { PostFeedEntity } from './entity/postFeed.entity';
import { CommentEntity } from './entity/comment.entity';
import { PostReportTypes, ReportEntity } from './entity/report.entity';
import { PostLikeEntity } from './entity/postLike.entity';
import { CommentLikeEntity } from './entity/commentLike.entity';

@Injectable()
export class PostsService {

    constructor(
        @InjectRepository(PostEntity) private postRepository : Repository<PostEntity>,
        @InjectRepository(TagEntity) private tagRepository : Repository<TagEntity>,
        @InjectRepository(PostFeedEntity) private postFeedRepository : Repository<PostFeedEntity>,
        @InjectRepository(CommentEntity) private commentRepository : Repository<CommentEntity>,
        @InjectRepository(ReportEntity) private reportRepository : Repository<ReportEntity>,
        @InjectRepository(PostLikeEntity) private postLikeRepository : Repository<PostLikeEntity>,
        @InjectRepository(CommentLikeEntity) private commentLikeRepository : Repository<CommentLikeEntity>,

        @Inject(forwardRef(() => UserService))
        private readonly userService : UserService,
        private readonly fileService : FilesService,

        private dataSource : DataSource
    ){}

    async getPostById(id : number) : Promise<PostEntity>{
        return await this.postRepository.findOneOrFail({
            where : {id},
            relations : ['user', 'tag']
        })
    }

    async getComments(id : number, userId : number) : Promise<Partial<CommentEntity>[]>{

        const currentUserRootComment = await this.commentRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('user.avatar', 'avatar')
            .where('user.id = :userId', {userId})
            .andWhere('comment.post.id = :id', {id})
            .orderBy('comment.createdAt', 'DESC')
            .getMany()

        const RestUserRootComment = await this.commentRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('user.avatar', 'avtar')
            .where('user.id != :userId', {userId})
            .where('comment.post.id = :id', {id})
            .orderBy('comment.createdAt', 'DESC')
            .getMany()
    
        console.log(currentUserRootComment);
        console.log(RestUserRootComment);
        
        const allComments = [...currentUserRootComment, ...RestUserRootComment]

        const treeRepository = this.dataSource.getTreeRepository(CommentEntity);

        return await Promise.all(
            allComments.map(async (c) => {
                const { replies } = await treeRepository.findDescendantsTree(c, { relations: ['user'] });

                return {
                ...c,
                replies,
                isViewerLiked: Boolean(
                    await this.postLikeRepository
                    .createQueryBuilder('commentLike')
                    .where('commentLike.user.id = :currentUserID', { userId })
                    .andWhere('commentLike.comment.id = :commentID', { commentID: c.id })
                    .getRawOne()
                ),
                };
            })
        );
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

    async getLikedPostsByUserID(id: number): Promise<PostEntity[]> {
        const likes = await this.postLikeRepository.createQueryBuilder('likes').where('user.id = :id', { id }).getMany();
        return likes.map((l) => l.post);
    }
    
    async getIsUserLikedPost(user: UserEntity, post: PostEntity): Promise<boolean> {
        return Boolean(await this.postLikeRepository.findOne({ where: { user, post }, relations: ['user', 'post'] }));
    }

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

    async getTagById(id : number) : Promise<TagEntity>{
        return await this.tagRepository.createQueryBuilder('tag')
            .where('tag.id =: id', {id})
            .leftJoinAndSelect('tag.post', 'post')
            .loadRelationCountAndMap('tag.postsNumber', 'tag.posts')
            .getOneOrFail();
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
                    const feedCount = await this.postFeedRepository.count({ where: { user: follower.user } });
                    console.log('feedCount', feedCount);
                    const maxUserFeedNumber = 20;
                    if (feedCount > maxUserFeedNumber) {
                        const oldestPost = await this.postFeedRepository.findOneOrFail({
                        where: { user: follower.user },
                        order: { createdAt: 'ASC' },
                        });
                        await this.postFeedRepository.delete(oldestPost.id);
                    }
                })
            )
        }
        catch(error){
            console.log(error)
        }
        return post
    }

    async updatePost(id : number, payload : Partial<UpdatePostDTO>) : Promise<PostEntity>{
        const post = await this.postRepository.findOneOrFail({where : {id}});
        if(payload.tags){
            try{
                const parsedTag = JSON.parse(payload.tags);
                const formattedTag = await Promise.all(
                    parsedTag.map(async (tag)=>{
                        const dbTag = await this.tagRepository.findOne({where : {name : tag}});
                        if(!dbTag){
                            return await this.tagRepository.save({
                                name : tag,
                                post : id
                            })
                        }
                        return dbTag
                    })
                )

                const formattedPost = {
                    ...payload,
                    tags : formattedTag
                }

                const updatePost = await this.postRepository.save({
                    ...post ,
                    ...formattedPost
                })

                return updatePost
            }
            catch(error){
                console.log(error);
                throw error;
            }
        }

        else{
            delete payload.tags;
            Object.assign(post, payload);
            const updatedPost = this.postRepository.save(post);
            return updatedPost;
        }
    }

    async deletePost(id : number) : Promise<void>{
        await this.postRepository.delete(id);
    }

    async reportPost(id :number, reason : PostReportTypes, userId : number){
        const post = await this.postRepository.findOneOrFail({where : {id}});
        const user = await this.userService.getByID(userId);

        const existingReport = await this.reportRepository.findOne({
            where: { reporter: { id: userId }, reported: { id } },
        });

        if (existingReport) {
            throw new Error("You have already reported this post");
        }

        await this.reportRepository.save({
            reporter : user,
            reported : post,
            reason
        })
    }

    async share(id : number, userId : number) : Promise<void>{
        console.log('share', id, userId);
    }

    async toggleLike(id : number, userId : number){
        const like = await this.postLikeRepository.createQueryBuilder('like')
            .where('like.post.id =: id', {id})
            .andWhere('like.user.id =: userId', {userId})
            .getOne();

        const post = await this.postRepository.findOneOrFail({where : {id}, relations : ['user']});
        const likedPostUser = post.user;

        if(like){
            await this.postLikeRepository.delete(like.id);
            // await this.notificationsService.deleteByPostID(postID, currentUserID);
        }
        else{
            const newPostLike = await this.postLikeRepository.save({
                post : {id},
                user : {id : userId}
            })
            // await this.notificationsService.create({
            //     type: NotificationTypes.LIKED_PHOTO,
            //     receiverUserID: author.id,
            //     initiatorUserID: currentUserID,
            //     postID,
            // });
        }
    }

    async createComment({postID, replyCommentID, text} : CreateCommentDTO, userId : number) : Promise<CommentEntity>{
        const user = await this.userService.getByID(userId);
        const post = await this.postRepository.findOneOrFail({where : {id : postID}});

        const parentComment = replyCommentID ? await this.commentRepository.findOneOrFail({where : {id : replyCommentID}}) : null;
    
        const newComment = await this.commentRepository.save({
            text,
            post,
            user,
            parentComment
        })

        return newComment
    }

    async updateComment(id : number, text : string) : Promise<CommentEntity>{
        const comment = await this.commentRepository.findOneOrFail({where : {id}, relations : ['post']});
        const newComment = await this.commentRepository.save({
            ...comment,
            text
        })
        return newComment;
    }

    async deleteComment(id : number) : Promise<void>{
        await this.commentRepository.delete(id)
    }

    async toggleCommentLike(id : number, userId : number){
        const CommentLike = await this.commentLikeRepository.createQueryBuilder('like')
            .where('like.comment.id =: id ', {id})
            .andWhere('like.user =: userId', {userId})
            .getOne();

        if(CommentLike){
            await this.commentLikeRepository.delete(CommentLike.id);
            // await this.notificationsService.deleteByPostID(post.id, currentUserID);
        }
        else{
            await this.commentLikeRepository.save({
                comment : {id},
                user : {id : userId}
            })
            // await this.notificationsService.create({
            //     type: NotificationTypes.LIKED_COMMENT,
            //     receiverUserID: author.id,
            //     initiatorUserID: currentUserID,
            //     postID: post.id,
            //     commentID,
            // });
        }
    }
}
