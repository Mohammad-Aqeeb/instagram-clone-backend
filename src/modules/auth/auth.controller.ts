import { Body, Controller, Get, Post } from '@nestjs/common';

import { UserEntity } from '../user/entity/user.entity';
import { CreateUserDTO } from '../user/dto/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService : AuthService){}

    @Post('register')
    async createUser(@Body() payload : CreateUserDTO) : Promise<UserEntity>{
        return await this.authService.register(payload);
    }

    @Get()
    async getAll() : Promise<UserEntity[]>{
        return this.getAll();
    }
}
