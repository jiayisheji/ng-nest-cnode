import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber } from './utils';

export const database = registerAs('database', () => {
  const host = getEnv('MONGO_HOST', 'localhost');
  const port = getEnvNumber('MONGO_PORT', 27017);
  const user = getEnv('MONGO_USER');
  const pass = getEnv('MONGO_PASS');
  const dbs = getEnv('MONGO_DBS');
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
