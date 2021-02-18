import { Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserEntity, UserRepository } from '@ng-nest-cnode/repository';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(@Inject(REQUEST) private request: Request, private userRepository: UserRepository) {}

  async info() {
    const user = this.request.user as UserEntity;
    // 检查用户是否存在，查询登录名
    const existUser = await this.userRepository.findOne(user.id);
    // 检查用户是否存在
    if (!existUser) {
      throw new UnauthorizedException('用户不存在');
    }

    return existUser;
  }
}
