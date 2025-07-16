import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
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

    @Get('self')
    async getSelf(@Request() req) : Promise<UserEntity>{
        return this.userService.getByID(req.user.id);
    }

    // @Get('suggestions')
    // async getSuggestions(
    //     @Query('page') page: number,
    //     @Query('limit') limit: number,
    //     @Request() req
    // ): Promise<UserSuggestion[]> {
    //     return await this.userService.getSuggestions(page, limit, req.user.id);
    // }
  
    @Get('recent-search')
    async getRecentSearch(@Request() req) : Promise<UserEntity>{
        return await this.userService.getRecentSearch(req.user.id);
    }

    @Post('recent-search')
    async addRecentSerach(@Body('id') id: number, @Body('tag') type : 'tag' | 'user' ,@Request() req){
        return await this.userService.addRecentSearch(+id, type, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':username')
    async getProfileByUsername(@Param('username') username: string, @Request() req): Promise<UserEntity> {
        return await this.userService.getProfileByUsername(username, req.user.id);
    }
}
