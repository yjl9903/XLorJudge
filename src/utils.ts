import { spawn } from 'child_process';
import { promises } from 'fs';
import * as cryptoRandomString from 'crypto-random-string';
import * as path from 'path';
import * as _rimraf from 'rimraf';

import { TEMP_PATH } from './configs';

export function isUndef(x: any) {
  return x === undefined || x === null;
}

export function isDef(x: any) {
  return x !== undefined && x !== null;
}

export function randomString(length = 32): string {
  return cryptoRandomString({ length });
}

export function b64encode(s: string): string {
  return Buffer.from(s).toString('base64');
}

export function b64decode(s: string): string {
  return Buffer.from(s, 'base64').toString();
}

export async function makeTempDir(): Promise<string> {
  const dir = path.join(TEMP_PATH, randomString());
  await promises.mkdir(dir);
  return dir;
}

export function exec(
  command: string,
  args: any[] = [],
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

export function rimraf(s: string) {
  return new Promise(res => _rimraf(s, () => res()));
}
