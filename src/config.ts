import path from 'path'
import * as LANG_CONFIG from './configs/lang.json'


enum Verdict {
  Waiting = -3,
  Judging,
  WrongAnswer,
  Accepted,
  TimeLimitExceeded,
  IdlenessLimitExceeded,
  MemoryLimitExceeded,
  RuntimeError,
  SystemError,
  CompileError,
}

const NSJAIL_PATH = '/bin/nsjail';

const PROJECT_PATH = __dirname;
// const CONFIG_PATH = path.join(PROJECT_PATH, 'config');
const RUN_PATH = path.join(PROJECT_PATH, 'run');
const DATA_PATH = path.join(RUN_PATH, 'data');
const SUB_PATH = path.join(RUN_PATH, 'sub');
const TEMP_PATH = path.join(RUN_PATH, 'temp');

const COMPILER_USER_ID = 999;
const COMPILER_GROUP_ID = 999;

const RUN_USER_ID = 65534;
const RUN_GROUP_ID = 65534;

const OUTPUT_LIMIT = 256;

const ENV = {
  PATH: process.env['PATH'],
  LANG: "en_US.UTF-8",
  LANGUAGE: "en_US:en",
  LC_ALL: "en_US.UTF-8",
};

export {
  Verdict, 
  NSJAIL_PATH, 
  PROJECT_PATH, 
  RUN_PATH, 
  DATA_PATH,
  SUB_PATH,
  TEMP_PATH,
  LANG_CONFIG,
  COMPILER_USER_ID,
  COMPILER_GROUP_ID,
  RUN_USER_ID,
  RUN_GROUP_ID,
  OUTPUT_LIMIT,
  ENV
};