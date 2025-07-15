import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './entity/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Public } from '../auth/decorator/public.decorator';

@Controller('user')
export class UserController {
  
    constructor(private userService : UserService){}

    // @Get()
    //     async getAll(@Query('search') search: string, @Request() req): Promise<UserEntity[]> {
    //     return await this.userService.getAll(search, req.user.id);
    // }

    @UseGuards(JwtAuthGuard)
    @Get(':username')
    async getProfileByUsername(@Param('username') username: string, @Request() req): Promise<UserEntity> {
        return await this.userService.getProfileByUsername(username, req.user.id);
    }
}
