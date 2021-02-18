import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber } from './utils';

export const jwt = registerAs('jwt', () => {
  // jwt key
  const secret = getEnv('JWT_SECRET');
  // token 过期时间 5m
  const accessTokenTtl = getEnvNumber('ACCESS_TOKEN_TTL', 5 * 60);
  // 刷新token 过期时间 30 Days
  const refreshTokenTtl = getEnvNumber('ACCESS_TOKEN_TTL', 30);
  return {
    secret,
    accessTokenTtl,
    refreshTokenTtl,
  };
});
