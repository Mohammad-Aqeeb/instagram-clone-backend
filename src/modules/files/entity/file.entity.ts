import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export interface uploadFileOption{
    // file : Express.Multer.File,
    quality : number,
    imageMaxSizeMB : number,
    type : 'image' | 'video'
}

@Entity()
export class FileEntity{

    @PrimaryGeneratedColumn()
    id : number

    @Column()
    url : string

    @Column()
    key : string
}