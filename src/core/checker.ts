import path from 'path';

import Submission from './submission';
import { CHK_PATH, LANG_CONFIG, RUN_USER_ID, RUN_GROUP_ID } from '../configs';
import { exec } from '../util';
import { Verdict } from '../verdict';

import Result from './result';

export default class Checker extends Submission {
  constructor(id: string, lang: string) {
    super(lang, path.join(CHK_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']));
  }
  clear(): void {}
}
