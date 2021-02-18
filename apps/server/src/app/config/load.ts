import { database } from './database';
import { github } from './github';
import { jwt } from './jwt';

export const load = [database, jwt, github];
