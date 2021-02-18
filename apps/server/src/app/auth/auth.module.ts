import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserModelModule } from '@ng-nest-cnode/repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './models/refresh-token.model';
import { GithubStrategy } from './passport/github.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [
    UserModelModule,
    MongooseModule.forFeature([{ name: RefreshToken.modelName, schema: RefreshToken.schema }]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy, GithubStrategy],
})
export class AuthModule {}
