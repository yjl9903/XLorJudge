import path from 'path';
import { promises } from 'fs';
import assert from 'assert';
import rimraf from 'rimraf';

import Submission from './submission';
import Checker from './checker';
import TestCase from './testcase';
import { Verdict } from '../verdict';
import { make_temp_dir, random_string } from '../util';
import { COMPILER_USER_ID, COMPILER_GROUP_ID } from '../configs';

import Result from './result';

class Runner {
  submission: Submission;
  checker: Checker;
  max_time: number;
  max_memory: number;
  run_dir: string = '';
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
    rimraf(this.run_dir, () => {});
    rimraf(this.out_dir, () => {});
  }
  async make_write_file(): Promise<string> {
    if (this.run_dir === '') {
      this.run_dir = await make_temp_dir();
    }
    if (this.out_dir === '') {
      this.out_dir = await make_temp_dir();
    }
    let file = path.join(this.out_dir, 'out_' + random_string());
    await promises.writeFile(file, '');
    await promises.chown(file, COMPILER_USER_ID, COMPILER_GROUP_ID);
    return file;
  }

  async run(testcase: TestCase): Promise<Result> {
    let run_out = await this.make_write_file();
    let run_err = await this.make_write_file();

    assert(this.run_dir !== '');
    assert(this.out_dir !== '');

    let result = await this.submission
      .run(
        this.run_dir,
        '',
        [],
        [],
        false,
        this.max_time,
        this.max_memory,
        testcase.input_file,
        run_out,
        run_err
      )
      .catch(err => {
        throw new Error('Failed to Open Sandbox');
      });
    if (result.verdict === Verdict.Accepted) {
      result.verdict = await this.check(testcase, run_out);
    }
    return result;
  }
  async check(testcase: TestCase, output: string): Promise<Verdict> {
    let chk_out = await this.make_write_file();
    let files = [
      { src: testcase.input_file, dst: 'in', mode: '-R' },
      { src: output, dst: 'out', mode: '-R' },
      { src: testcase.output_file, dst: 'ans', mode: '-R' },
      { src: chk_out, dst: 'result', mode: '-B' }
    ];
    let chk_result = await this.checker.check(
      this.run_dir,
      '',
      [],
      files,
      false,
      this.max_time,
      this.max_memory,
      null,
      null,
      null
    );

    if (chk_result.verdict !== Verdict.Accepted) {
      if (chk_result.exit_code === 3) {
        return Verdict.JudgeError;
      }
      if (chk_result.exit_code === 7) {
        return Verdict.Point;
      }
      if (chk_result.verdict !== Verdict.RuntimeError) {
        return chk_result.verdict;
      }
      return Verdict.WrongAnswer;
    }
    return Verdict.Accepted;
  }
}

export default Runner;
