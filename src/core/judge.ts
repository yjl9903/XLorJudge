import { update, ErrorMsg, ResultMsg } from '../cache';
import { b64encode } from '../util';
import { Verdict } from '../verdict';

import Checker from './checker';
import Runner from './runner';
import Submission from './submission';
import TestCase from './testcase';
// import { cache } from '../app';

export default async function(
  sub_id: string,
  sub_code: string,
  sub_lang: string,
  chk: Checker,
  max_time: number,
  max_memory: number,
  cases: Array<string>
): Promise<ErrorMsg | ResultMsg> {
  // cache.set(sub_id, { verdict: Verdict.Compiling }, 3600, err => {});
  update(sub_id, { verdict: Verdict.Compiling });

  const sub: Submission = new Submission(sub_lang);
  try {
    await sub.compile(sub_code, Math.max(max_time * 5, 15));
  } catch (err) {
    // return CE msg
    const result: ErrorMsg = {
      verdict: Verdict.CompileError,
      message: b64encode(err.message)
    };
    if ('verdict' in err && err.verdict === Verdict.SystemError) {
      result.verdict = Verdict.SystemError;
    }
    // cache.set(sub_id, result, 3600, () => {});
    update(sub_id, result);
    return result;
  }

  // cache.set(sub_id, { verdict: Verdict.Judging, passed: 0 }, 3600, () => {});
  update(sub_id, { verdict: Verdict.Judging, passed: 0 });

  const result: ResultMsg = {
    verdict: Verdict.Accepted,
    passed: 0,
    time: 0,
    memory: 0
  };
  const runner = new Runner(sub, chk, max_time, max_memory);

  for (const fingerprint of cases) {
    try {
      const c = new TestCase(fingerprint);
      const tot = await runner.run(c);
      result.time = Math.max(result.time, tot.time);
      result.memory = Math.max(result.memory, tot.memory);
      if (tot.verdict !== Verdict.Accepted) {
        result.verdict = tot.verdict as
          | Verdict.Accepted
          | Verdict.WrongAnswer
          | Verdict.TimeLimitExceeded
          | Verdict.IdlenessLimitExceeded
          | Verdict.MemoryLimitExceeded
          | Verdict.RuntimeError
          | Verdict.Point;
        break;
      }
      result.passed += 1;
      // cache.set(
      //   sub_id,
      //   { verdict: Verdict.Judging, passed: result.passed },
      //   3600,
      //   () => {}
      // );
      update(sub_id, { verdict: Verdict.Judging, passed: result.passed });
    } catch (err) {
      sub.clear();
      runner.clear();
      const verdict:
        | Verdict.CompileError
        | Verdict.SystemError
        | Verdict.JudgeError =
        'verdict' in err ? err.verdict : Verdict.SystemError;
      // cache.set(sub_id, { verdict, message: err.message }, 3600, () => {});
      update(sub_id, { verdict, message: err.message });
      return { verdict, message: err.message };
    }
  }

  // cache.set(sub_id, result, 3600, () => {});
  update(sub_id, result);
  sub.clear();
  runner.clear();

  return result;
}
