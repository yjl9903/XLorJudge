import path from 'path';
import rimraf from 'rimraf';

import { GEN_PATH, LANG_CONFIG } from '../configs';
import { Submission, SubmissionType, TestCase } from '../core';
import { make_temp_dir } from '../util';
import { Verdict } from '../verdict';

export default class Generator extends Submission {
  constructor(id: string, lang: string) {
    super(
      lang,
      path.join(GEN_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']),
      SubmissionType.GEN
    );
  }

  async generate(testcase: TestCase, code: string, args: string[]) {
    await testcase.write('in', '');

    try {
      await this.compile(code, 30);
    } catch (err) {
      throw err;
    }

    const run_dir = await make_temp_dir();
    try {
      const result = await this.run(
        run_dir,
        undefined,
        [...this.lang_config['execute']['args'], ...args],
        undefined,
        true,
        30,
        1024,
        null,
        testcase.input_file,
        null
      );
      if (result.verdict !== Verdict.Accepted) {
        await testcase.clear().catch(() => {});
      }
      return result;
    } catch (err) {
      await testcase.clear().catch(() => {});
      throw err;
    } finally {
      rimraf(run_dir, () => {});
    }
  }
}
