import { spawn } from 'child_process';
import cryptoRandomString from 'crypto-random-string';
import { promises } from 'fs';
import path from 'path';

import { TEMP_PATH } from './configs';

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
