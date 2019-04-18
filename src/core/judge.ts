import Submission from './submission'
import { Verdict } from '../config'

export default async function(sub_id: string, sub_code: string, sub_lang: string, 
  max_time: number, max_memory): Promise<Object> {
  
  let res = { verdict: Verdict.Accepted, message: '' };  
  
  let sub = new Submission(sub_lang);
  await sub.compile(sub_code, Math.max(max_time * 5, 15)).catch((err) => {
    // return CE msg
    // console.log(err.message);
    res.verdict = Verdict.CompileError;
    res.message = Buffer.from(err.message).toString('base64');
  });

  if (res.verdict === Verdict.CompileError) {
    return res;
  }

  return res;
}