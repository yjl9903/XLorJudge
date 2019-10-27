import path from 'path';
import { promises } from 'fs';
import judge from '../../src/core/judge';
import TestCase from '../../src/core/testcase';
import Checker from '../../src/core/checker';

function rand(l: number, r: number) {
  return l + Math.round(Math.random() * (r - l));
}

const character_table = '0123456789abcdefghijklmnopqrstuvwxyz';
function random_string(length = 32) {
  return Array.apply(null, Array(length))
    .map(() => character_table[rand(0, character_table.length - 1)])
    .join('');
}

function readCode(name: string) {
  return promises.readFile(path.join(__dirname, '../testcode', name), 'utf8');
}

const CaseNum = 5;
const cases = [];

(async () => {
  async function testJudge(
    src: string,
    lang: string,
    cases = [],
    time = 1,
    memory = 64
  ) {
    return await judge(
      random_string(),
      await readCode(src),
      lang,
      new Checker('chk', 'cpp'),
      time,
      memory,
      cases
    );
  }

  const chk = new Checker('chk', 'cpp');
  await chk.compile(await readCode('chk.cpp'), 30);

  for (let i = 0; i < CaseNum; i++) {
    const id = random_string();
    const a = rand(0, 100000),
      b = rand(0, 100000);
    const c = new TestCase(id);
    await c.write('in', `${a} ${b}`);
    await c.write('out', `${a + b}`);
    cases.push(id);
  }

  await testJudge('a.cpp', 'cpp', cases);
})();
