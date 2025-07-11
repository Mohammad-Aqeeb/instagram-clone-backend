import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { userEntity } from '../user/entity/user.entity';

@Controller('auth')
export class AuthController {

    
    constructor(private readonly userService : UserService){}

    @Post('register')
    async createUser(@Body() payload : Partial<userEntity>) : Promise<userEntity>{
        return await this.userService.create(payload);
    }
}
