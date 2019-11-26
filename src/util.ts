import { spawn } from 'child_process';
import cryptoRandomString from 'crypto-random-string';
import { promises } from 'fs';
import path from 'path';

import { TEMP_PATH } from './configs';
import { checkLang } from './configs/lang';

export function isUndef(x: any) {
  return x === undefined || x === null;
}
export function isDef(x: any) {
  return x !== undefined && x !== null;
}

export function random_string(length = 32): string {
  return cryptoRandomString({ length });
}

export function b64encode(s: string): string {
  return Buffer.from(s).toString('base64');
}
export function b64decode(s: string): string {
  return Buffer.from(s, 'base64').toString();
}

export async function make_temp_dir(): Promise<string> {
  const dir = path.join(TEMP_PATH, random_string());
  await promises.mkdir(dir);
  return dir;
}

export async function exec(
  command: string,
  args: Array<string> = [],
  options: object = {}
): Promise<{ code: number; signal: string }> {
  return new Promise((res, rej) => {
    const p = spawn(command, args, options);
    p.on('close', (code, signal) => {
      res({ code, signal });
    });
    p.on('error', rej);
  });
}

export function checkJudgeField({
  id,
  max_time,
  max_memory,
  cases,
  checker,
  interactor,
  lang,
  code
}): string {
  try {
    if (isUndef(id)) return 'id does not exit';
    if (isUndef(max_time)) return 'max_time does not exit';
    if (isUndef(max_memory)) return 'max_memory does not exit';
    if (isUndef(lang)) return 'lang does not exit';
    if (!checkLang(lang)) return `lang ${lang} does not support`;
    if (isUndef(code)) return 'code does not exit';
    if (isUndef(checker) && isUndef(interactor))
      return 'checker and interactor does not exit';
    if (isDef(checker)) {
      if (isUndef(checker.id)) return 'checker.id does not exit';
      if (isUndef(checker.lang)) return 'checker.lang does not exit';
      if (!checkLang(checker.lang))
        return `checker.lang ${checker.lang} does not support`;
    }
    if (isDef(interactor)) {
      if (isUndef(interactor.id)) return 'interactor.id does not exit';
      if (isUndef(interactor.lang)) return 'interactor.lang does not exit';
      if (!checkLang(interactor.lang))
        return `interactor.lang ${interactor.lang} does not support`;
    }
    if (!Array.isArray(cases)) return 'cases do not exit';
    if (cases.length === 0) return 'no test cases';
    return null;
  } catch (err) {
    return 'unknown';
  }
}
