import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config as awsConfig} from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();

  const configService = app.get(ConfigService)
  awsConfig.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
