import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategy/local-auth.strategy';
import { jwtStrategy } from './strategy/jwt-auth.strategy';

@Module({
  imports : [
    UserModule,
    JwtModule.registerAsync({
        useFactory: () => ({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
        }),
    })
  ],
  providers: [AuthService, jwtStrategy, LocalStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
