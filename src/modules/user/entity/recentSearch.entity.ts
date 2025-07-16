import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class recentSearchEntity{
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    itemID : number

    @Column()
    type : 'user' | 'tag'

    @ManyToOne(()=> UserEntity, (u)=> u.recentSearch,{
        cascade : true
    })
    user : UserEntity
}