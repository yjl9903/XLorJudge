import Submission from './submission'

export default async function(sub_id: string, sub_code: string, sub_lang: string, 
  max_time: number, max_memory): Promise<Object> {
  
  let res = {};  
  
  try {
    let sub = new Submission(sub_lang);
    sub.compile(sub_code, Math.max(max_time * 5, 15));

  } catch(ex) {

  }

  return res;
}