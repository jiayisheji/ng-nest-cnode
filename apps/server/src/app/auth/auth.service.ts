import { Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserRepository } from '@ng-nest-cnode/repository';
import { compare, genSalt, hash } from 'bcrypt';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './passport/jwt-payload';
import { TokenService } from './token.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @Inject(REQUEST) private request: Request,
    private userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * 注册
   * @param registerDto
   */
  async register(registerDto: RegisterDto): Promise<unknown> {
    const { username, email, password } = registerDto;
    // 检查用户是否存在，查询登录名和邮箱
    const existUser = await this.userRepository.findOne({
      $or: [{ username }, { email }],
    });
    // 返回null不存在
    if (existUser) {
      throw new UnauthorizedException('用户名或邮箱已被使用');
    }
    // hash加密密码，不能明文存储到数据库
    const salt = await genSalt(12);
    const hashedPassword = await hash(password, salt);
    // 保存用户到数据库
    const user = this.userRepository.create();
    user.username = registerDto.username;
    user.password = hashedPassword;
    user.nickname = registerDto.username;
    await user.save();
    const payload = { sub: user.id };

    return {};
  }

  /**
   * 登录
   * @param loginDto
   * @param ipAddress
   */
  async login(loginDto: LoginDto, ipAddress: string): Promise<unknown> {
    const { username, password } = loginDto;
    // 检查用户是否存在，查询登录名
    const existUser = await this.userRepository.findOne({ username }, '+password');
    console.log(existUser);
    // 检查用户是否存在
    if (!existUser) {
      throw new UnauthorizedException('用户不存在');
    }
    // 检查密码是否匹配
    const passwordMatch = await compare(password, existUser.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('用户名或者密码错误');
    }
    // 生成用户的 token
    const payload: JwtPayload = {
      sub: existUser.id,
    };
    const result = this.tokenService.createAccessToken(payload);
    // 保存用户的 refreshToken
    result['refreshToken'] = await this.tokenService.createRefreshToken(existUser.id, ipAddress);

    return result;
  }

  activate(): { message: string } {
    return { message: 'Welcome to server!' };
  }
  async logout(refreshToken: string): Promise<{ message: string }> {
    // const user = await this.userRepository.update('5f5a29fdba5f3838145a3999', { password: '123456' });
    console.log(this.request.user);

    return { message: 'Welcome to server!' };
  }

  createToken(): { message: string } {
    return { message: 'Welcome to server!' };
  }
}
