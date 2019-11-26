import { promises } from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import { make_temp_dir, random_string } from '../util';
import { Verdict } from '../verdict';

import Checker, { getVerdict } from './checker';
import Result from './result';
import Submission from './submission';
import TestCase from './testcase';

class Runner {
  submission: Submission;
  checker: Checker;
  max_time: number;
  max_memory: number;
  out_dir: string = '';

  constructor(
    submission: Submission,
    chk: Checker,
    max_time: number,
    max_memory: number
  ) {
    this.submission = submission;
    this.checker = chk;
    this.max_time = max_time;
    this.max_memory = max_memory;
  }

  clear(): void {
    rimraf(this.out_dir, () => {});
  }

  async make_write_file(): Promise<string> {
    if (this.out_dir === '') {
      this.out_dir = await make_temp_dir();
    }
    const file = path.join(this.out_dir, 'out_' + random_string());
    await promises.writeFile(file, '');
    await promises.chmod(file, 0o766); // file mod for writing
    return file;
  }

  async run(testcase: TestCase): Promise<Result> {
    const run_out = await this.make_write_file();
    const run_err = await this.make_write_file();
    const run_dir = await make_temp_dir();

    try {
      const result = await this.submission.run(
        run_dir,
        '',
        this.submission.lang_config['execute']['args'],
        [],
        false,
        this.max_time,
        this.max_memory,
        testcase.input_file,
        run_out,
        run_err
      );
      if (result.verdict === Verdict.Accepted) {
        result.verdict = await this.check(testcase, run_out);
      }
      return result;
    } finally {
      rimraf(run_dir, () => {});
    }
  }

  async check(testcase: TestCase, output: string): Promise<Verdict> {
    const chk_out = await this.make_write_file();
    const files = [
      { src: testcase.input_file, dst: 'in', mode: '-R' },
      { src: output, dst: 'out', mode: '-R' },
      { src: testcase.answer_file, dst: 'ans', mode: '-R' },
      { src: chk_out, dst: 'result', mode: '-B' }
    ];
    const run_dir = await make_temp_dir();

    try {
      const chk_result = await this.checker.run(
        run_dir,
        '',
        ['in', 'out', 'ans', 'result'],
        files,
        false,
        this.max_time,
        this.max_memory
      );
      return getVerdict(chk_result);
    } finally {
      rimraf(run_dir, () => {});
    }
  }
}

export default Runner;
