import { spawn } from 'child_process';
import * as path from 'path';
import { promises, createReadStream } from 'fs';

import cryptoRandomString from 'crypto-random-string';
import _rimraf from 'rimraf';

import { TEMP_PATH } from './configs';

export function isUndef<T>(
  object: T | undefined | null
): object is undefined | null {
  return object === undefined || object === null;
}

export function isDef<T>(object: T | undefined | null): object is T {
  return object !== undefined && object !== null;
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

interface IExecResult {
  code: number;
  signal: string;
}

export function exec(
  command: string,
  args: any[] = [],
  options: object = {}
): Promise<IExecResult> {
  return new Promise((res, rej) => {
    const process = spawn(command, args, options);
    process.on('close', (code, signal) => {
      if (isDef(code) && isDef(signal)) {
        res({ code, signal });
      } else {
        rej();
      }
    });
    process.on('error', rej);
  });
}

export function rimraf(path: string) {
  return new Promise((res) => _rimraf(path, res));
}

export function readFileHead(file: string, maxLength = 255): Promise<string> {
  const inputStream = createReadStream(file, {
    start: 0,
    end: maxLength,
    encoding: 'utf-8',
  });

  return new Promise((res, rej) => {
    const content: string[] = [];
    inputStream.on('data', (data) => {
      if (typeof data === 'string') {
        // data is a string
        content.push(data);
      } else {
        // data is a buffer
      }
    });
    inputStream.on('close', () => {
      res(content.join(''));
    });
    inputStream.on('error', rej);
  });
}
