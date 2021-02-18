import { Module } from '@nestjs/common';
import { UserModelModule } from '@ng-nest-cnode/repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [UserModelModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
