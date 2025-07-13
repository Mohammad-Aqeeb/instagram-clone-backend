import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

import { CreateUserDTO, UserJwtPayload, UserTokensInterface } from '../user/dto/user.dto';
import { UserEntity } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService : UserService,
        private readonly jwtService : JwtService
    ){}

    async register(payload : CreateUserDTO) : Promise<UserEntity>{
        const user = this.userService.create(payload);
        return user;
    }

    async login(user : UserEntity, is2FAEnabled=false) : Promise<UserTokensInterface>{
        const dbUser = await this.userService.getByID(user.id);
        if(!dbUser){
            throw new NotFoundException("User not found");
        }

        if (dbUser.isTwoFactorEnable && !is2FAEnabled) {
            throw new UnauthorizedException("2FA is required");
        }
        const payload : UserJwtPayload = {id : user.id , email : user.email, is2FAEnabled : is2FAEnabled}

        const accessToken = this.jwtService.sign(payload);
        const refreshToken =  this.jwtService.sign(payload,{
            expiresIn : process.env.JWT_REFRESH_EXPIRES_IN
        });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userService.setUpdateRefreshToken(user.id, hashedRefreshToken)

        return {
            user,
            accessToken,
            refreshToken,
        };
    }
    
}