import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, uploadFileOption } from './entity/file.entity';
import { Repository } from 'typeorm';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { S3 } from 'aws-sdk';

@Injectable()
export class FilesService {

    constructor(@InjectRepository(FileEntity) private fileEntity : Repository<FileEntity>){}

    async uploadFile(options : uploadFileOption) : Promise<FileEntity>{
        const validImageType = ['image/jpg', 'image/jpeg', 'image/png']
        const validImageSize = 1024 * 1024 * options.imageMaxSizeMB;

        const isInvalidType = !validImageType.includes(options.file.mimetype);
        if(isInvalidType){
            throw new HttpException('INVALID_FILE_TYPE', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        if(options.file.size > validImageSize){
            throw new HttpException('INVALID_FILE_SIZE', HttpStatus.UNPROCESSABLE_ENTITY)
        }
        
        const fileBuffer = await sharp(options.file.buffer).webp({ quality: options.quality }).toBuffer();
        const filename = uuidv4() + extname(options.file.originalname);

        const Bucket = process.env.AWS_PUBLIC_S3_BUCKET_NAME;
        if (!Bucket) {
            throw new Error('AWS_PUBLIC_S3_BUCKET_NAME is not defined');
        }

        const ACL = 'public-read'

        const s3 = new S3();
        const uploadFile = await s3.upload({
            Bucket,
            ACL,
            Body : fileBuffer,
            Key : filename
        }).promise();

        const newFile = await this.fileEntity.save({
            key : uploadFile.Key,
            url : uploadFile.Location
        })

        return newFile;
    }

    async deleteFile(id : number) : Promise<void>{
        const file = await this.fileEntity.findOneOrFail({where : {id}});

        const Bucket = process.env.AWS_PUBLIC_S3_BUCKET_NAME;
        if (!Bucket) {
            throw new Error('AWS_PUBLIC_S3_BUCKET_NAME is not defined');
        }

        const s3 = new S3();
        await s3.deleteObject({
            Bucket,
            Key : file?.key
        }).promise()

        await this.fileEntity.delete(id);
    }
}
