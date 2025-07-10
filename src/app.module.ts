import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { PostsModule } from './modules/posts/posts.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [UserModule, PostsModule, FilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
