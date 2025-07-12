import { Body, Controller, Get, Post } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entity/user.entity';
import { CreateUserDTO } from '../user/dto/user.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly userService : UserService){}

    @Post('register')
    async createUser(@Body() payload : CreateUserDTO) : Promise<UserEntity>{
        return await this.userService.create(payload);
    }

    @Get()
    async getAll() : Promise<UserEntity[]>{
        return this.getAll();
    }
}
