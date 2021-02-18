import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { GitHubProfile } from './github-profile';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      ...config.get('github'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: GitHubProfile, done: (error: null, data: GitHubProfile) => void) {
    profile.accessToken = accessToken;
    done(null, profile);
  }
}
