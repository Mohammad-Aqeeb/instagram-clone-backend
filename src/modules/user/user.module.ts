import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { FollowingEntity } from './entity/following.entity';
import { RecentSearchEntity } from './entity/recentSearch.entity';
import { FilesModule } from '../files/files.module';

@Module({
  imports : [TypeOrmModule.forFeature([UserEntity, FollowingEntity, RecentSearchEntity, FilesModule])],
  controllers: [UserController],
  providers: [UserService],
  exports : [UserService]
})
export class UserModule {}
