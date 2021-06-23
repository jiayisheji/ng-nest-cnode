import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber } from './utils';

export const database = registerAs('database', () => {
  const host = getEnv('MONGO_HOST', 'localhost');
  const port = getEnvNumber('MONGO_PORT', 27017);
  const user = getEnv('MONGO_USERNAME');
  const pass = getEnv('MONGO_PASSWORD');
  const dbs = getEnv('MONGO_DATABASE');
  console.log(host, port, user, pass, dbs);
  return {
    host,
    port,
    user,
    pass,
    dbs,
    uri: `mongodb://${user}:${pass}@${host}:${port}/${dbs}`,
  };
});
