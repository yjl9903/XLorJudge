import { promisify } from 'util';
import { createClient } from 'redis';

import { Verdict } from '../verdict';

const redisURL = 'redis://redis:6379';
const client = createClient(redisURL);

const get = promisify(client.get).bind(client);

client.on('error', err => {
  console.error(err);
});

export type WatingMsg = { verdict: Verdict.Waiting | Verdict.Compiling };
export type ErrorMsg = {
  verdict: Verdict.CompileError | Verdict.SystemError | Verdict.JudgeError;
  message: string;
};
export type JudgeMsg = { verdict: Verdict.Judging; passed: number };
export type ResultMsg = {
  verdict:
    | Verdict.Accepted
    | Verdict.WrongAnswer
    | Verdict.TimeLimitExceeded
    | Verdict.IdlenessLimitExceeded
    | Verdict.MemoryLimitExceeded
    | Verdict.RuntimeError
    | Verdict.Point;
  passed: number;
  time: number;
  memory: number;
};
type Msg = WatingMsg | ErrorMsg | JudgeMsg | ResultMsg;

export function update(token: string, msg: Msg) {
  const str = JSON.stringify(msg);
  client.set(token, str);
}

export async function query(token: string): Promise<Msg> {
  return JSON.parse(await get(token)) as Msg;
}

export function subscribe(token: string, fn: () => void) {}

export function unsubscribe(token: string) {}
