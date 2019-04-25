import Submission from './submission'
import TestCase from './testcase'
import Runner from './runner'
import Checker from './checker'

import { Verdict } from '../config'
import { b64encode } from '../util'

export default async function(sub_id: string, sub_code: string, sub_lang: string, 
  chk: Checker, max_time: number, max_memory: number, cases: Array<string>): Promise<Object> {
  
  let res: any = { verdict: Verdict.Accepted, message: '' };  
  
  let sub: Submission = new Submission(sub_lang);
  await sub.compile(sub_code, Math.max(max_time * 5, 15)).catch((err) => {
    // return CE msg
    // console.log(err.message);
    res.verdict = Verdict.CompileError;
    res.message = b64encode(err.message);
  });
  if (res.verdict === Verdict.CompileError) return res;

  res = { verdict: Verdict.Accepted, sum: 0, time: 0, memory: 0 };
  let runner = new Runner(sub, chk, max_time, max_memory);

  for (let fingerprint of cases) {
    try {
      let result = await runner.run(new TestCase(fingerprint));
      if (result.verdict !== Verdict.Accepted) {
        res.verdict = result.verdict;
        break;
      }
      res.time = Math.max(res.time, result.time);
      res.memory = Math.max(res.memory, result.memory);
      res.sum += 1;
    } catch(ex) {
      sub.clear(); runner.clear();
      return { verdict: Verdict.SystemError, message: ex.message };
    }
  }

  sub.clear(); runner.clear();

  return res;
}