import { registerAs } from '@nestjs/config';
import { getEnv } from './utils';

export const github = registerAs('github', () => {
  const clientID = getEnv('GITHUB_CLIENT_ID');
  const clientSecret = getEnv('GITHUB_CLIENT_SECRET');
  const callbackURL = `${getEnv('GITHUB_CALLBACK_URL')}/${clientID}`;
  return {
    clientID,
    clientSecret,
    callbackURL,
  };
});
