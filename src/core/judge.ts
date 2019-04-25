import Submission from './submission'
import TestCase from './testcase'
import Runner from './runner'
import Checker from './checker'
import { cache } from '../app'

import { Verdict } from '../config'
import { b64encode } from '../util'

export default async function(sub_id: string, sub_code: string, sub_lang: string, 
  chk: Checker, max_time: number, max_memory: number, cases: Array<string>): Promise<Object> {
  
  let res: any = { verdict: Verdict.Accepted, message: '' };  
  
  cache.set(sub_id, { verdict: Verdict.Compiling }, 3600, err => {});

  let sub: Submission = new Submission(sub_lang);
  await sub.compile(sub_code, Math.max(max_time * 5, 15)).catch((err) => {
    // return CE msg
    // console.log(err.message);
    res.verdict = Verdict.CompileError;
    res.message = b64encode(err.message);
  });
  if (res.verdict === Verdict.CompileError) {
    cache.set(sub_id, res, 3600, (err) => {});
    return res;
  }
  cache.set(sub_id, { verdict: Verdict.Judging }, 3600, (err) => {});

  res = { verdict: Verdict.Accepted, sum: 0, time: 0, memory: 0 };
  let runner = new Runner(sub, chk, max_time, max_memory);

  for (let fingerprint of cases) {
    try {
      let result = await runner.run(new TestCase(fingerprint));
      res.time = Math.max(res.time, result.time);
      res.memory = Math.max(res.memory, result.memory);
      if (result.verdict !== Verdict.Accepted) {
        res.verdict = result.verdict;
        break;
      }
      res.sum += 1;
      cache.set(sub_id, { verdict: Verdict.Judging, sum: res.sum }, 3600, (err) => {});
    } catch(ex) {
      sub.clear(); runner.clear();
      cache.set(sub_id, { verdict: Verdict.SystemError, message: ex.message }, 3600, (err) => {});
      return { verdict: Verdict.SystemError, message: ex.message };
    }
  }

  cache.set(sub_id, res, 3600, (err) => {});
  sub.clear(); runner.clear();

  return res;
}