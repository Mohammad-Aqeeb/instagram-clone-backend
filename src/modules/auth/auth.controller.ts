import { Body, Controller, Get, Post } from '@nestjs/common';

import { UserEntity } from '../user/entity/user.entity';
import { CreateUserDTO, UserTokensInterface } from '../user/dto/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService : AuthService){}

    @Post('register')
    async registerUser(@Body() payload : CreateUserDTO) : Promise<UserEntity>{
        return await this.authService.register(payload);
    }

    @Post('login')
    async loginUser(@Body() data: UserEntity) : Promise<UserTokensInterface>{
        return await this.authService.login(data);
    }
}
