import { cache } from '../app';
import { b64encode } from '../util';
import { Verdict } from '../verdict';

import Checker from './checker';
import Runner from './runner';
import Submission from './submission';
import TestCase from './testcase';

export default async function(
  sub_id: string,
  sub_code: string,
  sub_lang: string,
  chk: Checker,
  max_time: number,
  max_memory: number,
  cases: Array<string>
): Promise<
  | { verdict: Verdict; message: string }
  | { verdict: Verdict; sum: number; time: number; memory: number }
> {
  cache.set(sub_id, { verdict: Verdict.Compiling }, 3600, err => {});

  const sub: Submission = new Submission(sub_lang);
  try {
    await sub.compile(sub_code, Math.max(max_time * 5, 15));
  } catch (err) {
    // return CE msg
    const result = {
      verdict: Verdict.CompileError,
      message: b64encode(err.message)
    };
    if ('verdict' in err && err.verdict === Verdict.SystemError) {
      result.verdict = Verdict.SystemError;
    }
    cache.set(sub_id, result, 3600, () => {});
    return result;
  }

  cache.set(sub_id, { verdict: Verdict.Judging }, 3600, () => {});

  const result = { verdict: Verdict.Accepted, sum: 0, time: 0, memory: 0 };
  const runner = new Runner(sub, chk, max_time, max_memory);

  for (const fingerprint of cases) {
    try {
      const c = new TestCase(fingerprint);
      const tot = await runner.run(c);
      result.time = Math.max(result.time, tot.time);
      result.memory = Math.max(result.memory, tot.memory);
      if (tot.verdict !== Verdict.Accepted) {
        result.verdict = tot.verdict;
        break;
      }
      result.sum += 1;
      cache.set(
        sub_id,
        { verdict: Verdict.Judging, sum: result.sum },
        3600,
        () => {}
      );
    } catch (err) {
      sub.clear();
      runner.clear();
      cache.set(
        sub_id,
        { verdict: Verdict.SystemError, message: err.message },
        3600,
        () => {}
      );
      return { verdict: Verdict.SystemError, message: err.message };
    }
  }

  cache.set(sub_id, result, 3600, () => {});
  sub.clear();
  runner.clear();

  return result;
}
