import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [UserModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
