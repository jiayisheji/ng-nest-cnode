import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '@ng-nest-cnode/repository';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from './passport/jwt-payload';

@Injectable()
export class TokenService {
  // @todo: should be put in redis cache
  private readonly usersExpired: number[] = [];

  constructor(private userRepository: UserRepository, private jwtService: JwtService, private configService: ConfigService) {}

  async validatePayload(payload: JwtPayload): Promise<{ id: string }> {
    const tokenBlacklisted = await this.isBlackListed(payload.sub, payload.exp);
    if (!tokenBlacklisted) {
      return {
        id: payload.sub,
      };
    }
    return null;
  }

  async getAccessTokenFromRefreshToken(refreshToken: string, oldAccessToken: string, ipAddress: string) {
    // 检查刷新标记是否存在于数据库中

    // 刷新令牌仍然有效
    // 生成新的访问令牌
    const oldPayload = await this.validateToken(oldAccessToken, true);
    const payload = {
      sub: oldPayload.sub,
    };
    const accessToken = this.createAccessToken(payload);

    accessToken['refreshToken'] = await this.createRefreshToken(oldPayload.sub, ipAddress);
    return accessToken;
  }

  async isBlackListed(id: string, expire: number): Promise<boolean> {
    return this.usersExpired[id] && expire < this.usersExpired[id];
  }

  /**
   * 创建token
   * @param payload
   */
  createAccessToken(
    payload: JwtPayload,
  ): {
    accessToken: string;
  } {
    const options = {
      expiresIn: '5m',
      jwtid: uuidv4(),
    };
    const accessToken = this.jwtService.sign(payload, options);
    return {
      accessToken,
    };
  }

  async createRefreshToken(userId: string, ipAddress: string) {
    const refreshToken = randomBytes(64).toString('hex');
    return refreshToken;
  }

  /**
   * 删除与用户关联的所有刷新令牌
   * @param id 用户id
   */
  async deleteRefreshTokenForUser(id: string) {
    // await this.delete({ userId: Types.ObjectId(id) });
    await this.revokeTokenForUser(id);
  }

  /** 验证token */
  private async validateToken(token: string, ignoreExpiration = false): Promise<JwtPayload> {
    return this.jwtService.verify(token, {
      ignoreExpiration,
    });
  }

  /**
   * 撤销用户 token
   * @param id 用户id
   */
  private async revokeTokenForUser(id: string) {}
}
