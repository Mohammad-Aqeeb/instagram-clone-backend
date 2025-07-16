import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class FollowingEntity{
    @PrimaryGeneratedColumn()
    id : string

    @ManyToOne(()=> UserEntity, (user)=> user.following,{
        cascade : true
    })
    user : UserEntity;

    @ManyToOne(()=> UserEntity, (user)=> user.follower,{
        cascade : true
    })
    target : UserEntity;
}