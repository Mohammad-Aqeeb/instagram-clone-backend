import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { UserEntity } from './entity/user.entity';
import { CreateUserDTO, UpdateUserDTO, UserValidationDTO } from './dto/user.dto';
import { FollowingEntity } from './entity/following.entity';
import { RecentSearchEntity } from './entity/recentSearch.entity';
import { TagEntity } from '../posts/entity/tag.entity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity) 
        private userRepository : Repository<UserEntity>,
        @InjectRepository(FollowingEntity)
        private readonly userFollowingsRepository: Repository<FollowingEntity>,
        @InjectRepository(RecentSearchEntity)
        private readonly recentSearchRepository: Repository<RecentSearchEntity>,
    ){}

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

    async updateUser(id : number, body : Partial<UpdateUserDTO>) : Promise<UserEntity>{
        const user = await this.userRepository.findOne({where : {id}});
        if(!user){
            throw new NotFoundException("user not found");
        }
        const newUser = Object.assign(user, body);
        return await this.userRepository.save(newUser);
    }

    async getProfileByUsername(username : string, id : number) : Promise<UserEntity>{
        const user = await this.userRepository.findOne({where : {username}})
        if(!user){
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async isUsernamTaken(username : string) : Promise<boolean>{
        if(!username) throw new NotFoundException("User Not Found");
        const user = await this.userRepository.findOne({where : {username : username}})
        if(user) return true
        return false;
    }

    async isEmailTaken(email : string) : Promise<boolean>{
        if(!email) throw new NotFoundException("User Not Found");
        const user = await this.userRepository.findOne({where : {email : email}})
        if(user) return true
        return false
    }

    async getRecentSearch(id : number){
        const user = await this.userRepository
        .createQueryBuilder("user_entity")
        .where('user_entity.id = :id', {id})
        .leftJoinAndSelect('user_entity.recentSearch', 'recent_search_entity')
        .orderBy('recent_search_entity.createdAt', 'DESC')
        .getOneOrFail();

        const recentSearch = await Promise.all(
            user.recentSearch.map(async (s)=>{
                return s.type === 'user'
                ? { ...(await this.userRepository.findOne({ where: { id: s.itemID } })), recentSearch : s.id}
                : { ...(await this.userRepository.findOne({ where: { id: s.itemID } })), recentSearch : s.id}
            }
        ))
        return recentSearch;
    }

    async addRecentSearch(id : number, type : 'user'| 'tag', userId : number) : Promise<RecentSearchEntity>{

        const user = await this.userRepository.findOneOrFail({
            where: { id: userId },
            relations : ['recentSearch']
        });

        const index = user.recentSearch.findIndex((r)=>{
            return r.id === id && r.type === type
        })

        if(index !== -1){
            await this.recentSearchRepository.delete(user.recentSearch[index].id)
        }

        const recentSearch = await this.recentSearchRepository.save({
            itemID : id,
            type ,
            user
        })
        return recentSearch;
    }

    async removeRecentSearch(id : number) : Promise<void>{
        await this.recentSearchRepository.delete(id);
    }
}