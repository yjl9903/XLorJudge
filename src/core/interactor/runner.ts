import rimraf from 'rimraf';

import Runner from '../runner';
import Submission from '../submission';
import Interactor, { buildCmd } from './interactor';
import Checker, { getVerdict } from '../checker';
import Result from '../result';
import TestCase from '../testcase';
import { make_temp_dir } from '../../util';
import { SystemError } from '../error';
import { spawn } from 'child_process';
import { usage2Result } from '../usage';
import { Verdict } from '../../verdict';

export default class InteractorRunner extends Runner {
  interactor: Interactor;

  constructor(
    submission: Submission,
    interactor: Interactor,
    checker: Checker,
    max_time: number,
    max_memory: number
  ) {
    super(submission, checker, max_time, max_memory);
    this.interactor = interactor;
  }

  async run(
    testcase: TestCase,
    gen_ans: boolean = false,
    run_out: string = ''
  ): Promise<Result> {
    if (run_out === '') {
      run_out = await this.make_write_file();
    }
    // const run_err = await this.make_write_file();
    const chk_out = await this.make_write_file();

    const sub_run = await make_temp_dir();
    const sub_root = await make_temp_dir();
    const sub_info = await make_temp_dir();

    const int_run = await make_temp_dir();
    const int_root = await make_temp_dir();
    const int_info = await make_temp_dir();

    const [sub_cmd, sub_args] = buildCmd(
      sub_root,
      sub_info,
      this.submission,
      sub_run,
      this.submission.lang_config['execute']['args'],
      [],
      false,
      this.max_time,
      this.max_memory
    );

    const [int_cmd, int_args] = buildCmd(
      int_root,
      int_info,
      this.interactor,
      int_run,
      gen_ans ? ['in', 'out'] : ['in', 'out', 'ans', 'result'],
      gen_ans
        ? [
            { src: testcase.input_file, dst: 'in', mode: '-R' },
            { src: run_out, dst: 'out', mode: '-B' }
          ]
        : [
            { src: testcase.input_file, dst: 'in', mode: '-R' },
            { src: run_out, dst: 'out', mode: '-B' },
            { src: testcase.answer_file, dst: 'ans', mode: '-R' },
            { src: chk_out, dst: 'result', mode: '-B' }
          ],
      gen_ans,
      this.max_time,
      this.max_memory
    );

    async function interaction() {
      const sub = spawn(sub_cmd, sub_args);
      const int = spawn(int_cmd, int_args);

      sub.stdin.on('error', () => {});
      int.stdin.on('error', () => {});

      sub.stdout.on('data', chunk => {
        int.stdin.write(chunk);
      });

      int.stdout.on('data', chunk => {
        sub.stdin.write(chunk);
      });

      return new Promise((res, rej) => {
        let cnt = 0;
        const ans = {
          sub: {
            code: 0,
            signal: null
          },
          int: {
            code: 0,
            signal: null
          }
        };

        sub.on('close', (code, signal) => {
          cnt += 1;
          ans.sub.code = code;
          ans.sub.signal = signal;
          if (cnt === 2) {
            res(ans);
          }
        });

        int.on('close', (code, signal) => {
          cnt += 1;
          ans.int.code = code;
          ans.int.signal = signal;
          if (cnt === 2) {
            res(ans);
          }
        });

        sub.on('error', rej);
        int.on('error', rej);
      });
    }

    try {
      await interaction();

      const sub_result = await usage2Result(
        sub_info,
        this.max_time,
        this.max_memory,
        this.max_time * 2
      );
      const int_result = await usage2Result(
        int_info,
        this.max_time,
        this.max_memory,
        this.max_time * 2
      );

      if (sub_result.verdict !== Verdict.Accepted) {
        return sub_result;
      } else if (int_result.verdict !== Verdict.Accepted) {
        sub_result.verdict = getVerdict(int_result);
      } else if (this.checker) {
        sub_result.verdict = await this.check(testcase, run_out);
      }
      return sub_result;
    } catch (err) {
      console.error(err);
      throw new SystemError(err.message);
    } finally {
      rimraf(sub_run, () => {});
      rimraf(sub_root, () => {});
      rimraf(sub_info, () => {});
      rimraf(int_run, () => {});
      rimraf(int_root, () => {});
      rimraf(int_info, () => {});
    }
  }
}
