import path from 'path'
import { promises } from 'fs'
import assert from 'assert'

import rimraf from 'rimraf'

import Submission from './submission'
import Result from './result'
import TestCase from "./testcase"

import { Verdict, COMPILER_USER_ID, COMPILER_GROUP_ID } from '../config'
import { make_temp_dir, random_string } from '../util'

class Runner {
  submission: Submission;
  checker;
  max_time: number;
  max_memory: number;
  run_dir: string = '';
  out_dir: string = '';

  constructor(submission: Submission, checker, max_time: number, max_memory: number) {
    this.submission = submission;
    this.checker = checker;
    this.max_time = max_time;
    this.max_memory = max_memory;
    // this.work_dir = make_temp_dir();
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
    assert(await testcase.isExist());
    assert(this.run_dir !== ''); 
    assert(this.out_dir !== '');
    let result = await this.submission.run(this.run_dir, '', [], false, 
      this.max_time, this.max_memory, testcase.input_file, run_out, run_err);
    let ans = null;
    if (result.verdict === Verdict.Accepted) {
      ans = await this.check(run_out, result);
    } else {

    }
    return ans;
  }
  async check(output: string, result: Result): Promise<Result> {

    return result;
  }
}

export default Runner;