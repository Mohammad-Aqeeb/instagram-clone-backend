import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

import { UserEntity } from '../user/entity/user.entity';
import { CreateUserDTO, UserTokensInterface } from '../user/dto/user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService : AuthService){}

    @Post('register')
    async registerUser(@Body() payload: CreateUserDTO) : Promise<UserEntity>{
        return await this.authService.register(payload);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async loginUser(@Request() req) : Promise<UserTokensInterface>{
        console.log(req.user);
        return await this.authService.login(req.user);
    }
}
