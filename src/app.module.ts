import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { PostsModule } from './modules/posts/posts.module';
import { FilesModule } from './modules/files/files.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type : 'postgres',
      url : process.env.DATABASE_URL,
      autoLoadEntities : true,
      synchronize :true
    }),
    UserModule, PostsModule, FilesModule, NotificationsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
