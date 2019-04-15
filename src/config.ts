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

const PROJECT_PATH = __dirname;
// const CONFIG_PATH = path.join(PROJECT_PATH, 'config');
const RUN_PATH = path.join(PROJECT_PATH, 'run');
const DATA_PATH = path.join(RUN_PATH, 'data');
const SUB_PATH = path.join(RUN_PATH, 'sub');
const TEMP_PATH = path.join(SUB_PATH, 'temp');

export {
  Verdict, 
  PROJECT_PATH, 
  RUN_PATH, 
  DATA_PATH,
  SUB_PATH,
  TEMP_PATH,
  LANG_CONFIG
};