import { Column, Entity, ManyToOne } from "typeorm";
import { PostEntity } from "./post.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { BaseEntity } from "src/common/types/base.entity";


export enum   PostReportTypes {
  SPAM = 1,
  NUDITY,
  HATE,
  BULLING,
  AUTHOR_RIGHTS,
  SUICIDE,
  SCAM,
  FALSE_INFORMATION,
  DONT_LIKE,
}

@Entity()
export class ReportEntity extends BaseEntity{
 
    @ManyToOne(()=> PostEntity, (p)=> p.reports)
    reported : PostEntity;
    
    @ManyToOne(()=> UserEntity, (u)=> u.reportedPost)
    reporter : UserEntity;

    @Column()
    reason : PostReportTypes
}