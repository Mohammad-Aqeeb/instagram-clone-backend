import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entity/user.entity';
import { CreateUserDTO } from './dto/user.dto';

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private userRepository : Repository<UserEntity>){}

    async create (payload : CreateUserDTO): Promise<UserEntity>{
        const existingUser = await this.userRepository.findOne({where : {email : payload.email}});
        if(existingUser){
            throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
        }
        
        const user = this.userRepository.create(payload);
        return await this.userRepository.save(user);
    }
}