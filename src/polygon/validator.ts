import { promises } from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import { LANG_CONFIG, VAL_PATH } from '../configs';
import { Submission, SubmissionType, TestCase } from '../core';
import { make_temp_dir } from '../util';
import { Verdict } from '../verdict';

export default class Generator extends Submission {
  constructor(id: string, lang: string) {
    super(
      lang,
      path.join(VAL_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']),
      SubmissionType.VAL
    );
  }

  async validate(testcase: TestCase, code: string) {
    try {
      await this.compile(code, 30);
    } catch (err) {
      throw err;
    }

    const run_dir = await make_temp_dir();
    const val_dir = await make_temp_dir();
    const val_err = path.join(val_dir, 'val.err');

    try {
      const result = await this.run(
        run_dir,
        undefined,
        this.lang_config['execute']['args'],
        undefined,
        true,
        30,
        1024,
        testcase.input_file,
        val_err,
        null
      );
      if (result.verdict === Verdict.Accepted) {
        return result;
      }
      Reflect.set(
        result,
        'message',
        (await promises.readFile(val_err, 'utf8')).trim()
      );
      return result;
    } catch (err) {
      throw err;
    } finally {
      rimraf(run_dir, () => {});
      rimraf(val_dir, () => {});
    }
  }
}
