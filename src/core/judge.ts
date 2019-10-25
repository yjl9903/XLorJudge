import Submission from './submission';
import TestCase from './testcase';
import Runner from './runner';
import Checker from './checker';
import { cache } from '../app';

import { b64encode } from '../util';

export default async function(
  sub_id: string,
  sub_code: string,
  sub_lang: string,
  chk: Checker,
  max_time: number,
  max_memory: number,
  cases: Array<string>
): Promise<any> {
  let res: any = { verdict: Verdict.Accepted, message: '' };

  cache.set(sub_id, { verdict: Verdict.Compiling }, 3600, err => {});

  const sub: Submission = new Submission(sub_lang);
  try {
    await sub.compile(sub_code, Math.max(max_time * 5, 15));
  } catch (err) {
    // return CE msg
    res.verdict = Verdict.CompileError;
    if (err.message === 'Failed to Open Sandbox')
      res.verdict = Verdict.SystemError;
    res.message = b64encode(err.message);
    cache.set(sub_id, res, 3600, () => {});
    return res;
  }

  cache.set(sub_id, { verdict: Verdict.Judging }, 3600, () => {});

  res = { verdict: Verdict.Accepted, sum: 0, time: 0, memory: 0 };
  const runner = new Runner(sub, chk, max_time, max_memory);

  for (let fingerprint of cases) {
    try {
      const c = new TestCase(fingerprint);
      let result = await runner.run(c).catch(err => {
        throw err;
      });
      res.time = Math.max(res.time, result.time);
      res.memory = Math.max(res.memory, result.memory);
      if (result.verdict !== Verdict.Accepted) {
        res.verdict = result.verdict;
        break;
      }
      res.sum += 1;
      cache.set(
        sub_id,
        { verdict: Verdict.Judging, sum: res.sum },
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

  cache.set(sub_id, res, 3600, () => {});
  sub.clear();
  runner.clear();

  return res;
}
