import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { UserEntity } from './entity/user.entity';
import { CreateUserDTO, UserValidationDTO } from './dto/user.dto';

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private userRepository : Repository<UserEntity>){}

    async setUpdateRefreshToken(id :number, hashedRefreshtoken : string){
        this.userRepository.update(id, {hashedRefreshtoken})
    }

    async getByID(id: number, options: FindOneOptions<UserEntity> = {}): Promise<UserEntity> {
        const user =  await this.userRepository.findOne({ where: { id }, ...options });
        if(!user){
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async getUserByEmail(email : string) : Promise<UserEntity>{
        const user =await this.userRepository.findOne({where : {email}})
        if(!user){
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);
        }
        return user
    }

    async create (payload : CreateUserDTO): Promise<UserEntity>{
        const existingUser = await this.userRepository.findOne({where : {email : payload.email}});
        if(existingUser){
            throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
        }
        const user = this.userRepository.create(payload);
        return await this.userRepository.save(user);
    }

    async getProfileByUsername(username : string, id : number) : Promise<UserEntity>{
        const user = await this.userRepository.findOne({where : {username}})
        if(!user){
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async getRecentSearch(id : number){
        return 
    }

    async addRecentSearch(){

    }

    async removeRecentSearch(){
        
    }
}