import { Column, Entity, Index, ManyToMany } from "typeorm";
import { BaseEntity } from '../../../common/types/base.entity';

@Entity()
export class TagEntity extends BaseEntity {
  @Column()
  @Index()
  name: string;


}
