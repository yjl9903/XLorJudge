import path from 'path';
import LANG_CONFIG from './lang';

export { LANG_CONFIG };

export const NSJAIL_PATH = '/bin/nsjail';

export const PROJECT_PATH = path.join(__dirname, '..');
// const CONFIG_PATH = path.join(PROJECT_PATH, 'config');
export const RUN_PATH = path.join(PROJECT_PATH, 'run');
export const DATA_PATH = path.join(RUN_PATH, 'data');
export const SUB_PATH = path.join(RUN_PATH, 'sub');
export const TEMP_PATH = path.join(RUN_PATH, 'temp');
export const CHK_PATH = path.join(RUN_PATH, 'checker');

export const COMPILER_USER_ID = 999;
export const COMPILER_GROUP_ID = 999;

export const RUN_USER_ID = 65534;
export const RUN_GROUP_ID = 65534;

export const OUTPUT_LIMIT = 256;

export const ENV = {
  PATH: process.env['PATH'],
  LANG: 'en_US.UTF-8',
  LANGUAGE: 'en_US:en',
  LC_ALL: 'en_US.UTF-8'
};
