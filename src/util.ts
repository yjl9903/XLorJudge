import path from 'path';
import { spawn } from 'child_process';
import { promises } from 'fs';
import { TEMP_PATH } from './config';

export function rand(l: number, r: number): number {
  return l + Math.round(Math.random() * (r - l));
}

const character_table = '0123456789abcdefghijklmnopqrstuvwxyz';
export function random_string(length = 32): string {
  return Array.apply(null, Array(length))
    .map(() => character_table[rand(0, character_table.length - 1)])
    .join('');
}

export function b64encode(s: string): string {
  return Buffer.from(s).toString('base64');
}
export function b64decode(s: string): string {
  return Buffer.from(s, 'base64').toString();
}

export async function make_temp_dir(): Promise<string> {
  return new Promise(async (res, rej) => {
    while (true) {
      let dir = path.join(TEMP_PATH, random_string());
      try {
        await promises.mkdir(dir);
        res(dir);
        break;
      } catch (ex) {}
    }
  });
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
