import path from 'path';
import { spawn } from 'child_process';
import { promises } from 'fs';
import cryptoRandomString from 'crypto-random-string';

import { TEMP_PATH } from './config';

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
    let p = spawn(command, args, options);
    p.on('close', (code, signal) => {
      res({ code, signal });
      // if (code === 0) {
      //   res(signal);
      // } else {
      //   rej(new Error(`${command} failed with code ${code}`));
      // }
    });
    p.on('error', rej);
  });
}
