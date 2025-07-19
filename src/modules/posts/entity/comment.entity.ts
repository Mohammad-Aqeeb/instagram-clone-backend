import { Column, Entity, ManyToOne } from "typeorm";
import { PostEntity } from "./post.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { BaseEntity } from "src/common/types/base.entity";

@Entity()
export class CommentEntity extends BaseEntity{
    @Column()
    text : string

    @ManyToOne(()=>PostEntity, (p)=> p.comment, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    post : PostEntity

    @ManyToOne(()=> UserEntity, (u)=> u.commentedPost,{
        eager :true,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    user : UserEntity
}