import path from 'path';
import { uid, gid } from 'userid';
import LANG_CONFIG from './lang';

export { LANG_CONFIG };

export const ENABLE_POLYGON = process.env.ENABLE_POLYGON === 'true';

export const NSJAIL_PATH = '/bin/nsjail';

export const PROJECT_PATH = path.join(__dirname, '../..');
export const RUN_PATH = path.join(PROJECT_PATH, 'run');
export const DATA_PATH = path.join(RUN_PATH, 'data');
export const SUB_PATH = path.join(RUN_PATH, 'submission');
export const TEMP_PATH = path.join(RUN_PATH, 'temp');
export const CHK_PATH = path.join(RUN_PATH, 'checker');
export const INT_PATH = path.join(RUN_PATH, 'interactor');
export const GEN_PATH = path.join(RUN_PATH, 'generator');
export const VAL_PATH = path.join(RUN_PATH, 'validator');

export const COMPILER_USER_ID = uid('compiler');
export const COMPILER_GROUP_ID = gid('compiler');

export const RUN_USER_ID = uid('nobody');
export const RUN_GROUP_ID = gid('nogroup');

export const OUTPUT_LIMIT = 256;

export const ENV = {
  PATH: process.env['PATH'],
  LANG: 'en_US.UTF-8',
  LANGUAGE: 'en_US:en',
  LC_ALL: 'en_US.UTF-8'
};
