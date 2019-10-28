import { promisify } from 'util';
import EventEmitter from 'events';
import { createClient } from 'redis';

import { Verdict } from '../verdict';

const redisURL = 'redis://redis:6379';
const client = process.env.DEFAULT_REDIS
  ? createClient()
  : createClient(redisURL);

const get = promisify(client.get).bind(client);

client.on('error', err => {
  console.error(err);
});

export function closeRedis() {
  client.quit();
}

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
export type Msg = WatingMsg | ErrorMsg | JudgeMsg | ResultMsg;

const Bus = new EventEmitter();

export function update(token: string, msg: Msg) {
  const str = JSON.stringify(msg);
  client.set(token, str, 'EX', 3600 * 24);
  Bus.emit(token, msg);
}

export async function query(token: string): Promise<Msg> {
  return JSON.parse(await get(token)) as Msg;
}

export function subscribe(token: string, fn: (msg: Msg) => void) {
  Bus.addListener(token, fn);
}

export function unsubscribe(token: string, fn: (msg: Msg) => void) {
  Bus.removeListener(token, fn);
}
