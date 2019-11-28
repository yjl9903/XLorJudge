const fs = require('fs');
const axios = require('axios');
const path = require('path');

function b64encode(s) {
  return Buffer.from(s).toString('base64');
}
function b64decode(s) {
  return Buffer.from(s, 'base64').toString();
}

function rand(l, r) {
  return l + Math.round(Math.random() * (r - l));
}

const character_table = '0123456789abcdefghijklmnopqrstuvwxyz';
function random_string(length = 32) {
  return Array.apply(null, Array(length))
    .map(() => character_table[rand(0, character_table.length - 1)])
    .join('');
}

module.exports = async function testHttp(api, cases, casesBin) {
  let folder = 'aplusb';
  let checker = {
    checker: {
      id: 'chk',
      lang: 'cpp'
    }
  };

  async function httpJudge(src, lang, cases = [], time = 1, memory = 64) {
    async function queryState(id) {
      return new Promise((resolve, reject) => {
        let loopid = setInterval(() => {
          api.get('/query', { params: { id: id } }).then(res => {
            if (res.data.verdict > -2) {
              clearInterval(loopid);
              resolve(res.data);
            }
          });
        }, 500);
      });
    }
    const id = random_string();
    await api.post('/judge', {
      id: id,
      max_time: time,
      max_memory: memory,
      cases: cases,
      ...checker,
      lang: lang,
      code: b64encode(
        await fs.promises.readFile(path.join(__dirname, folder, src), 'utf8')
      )
    });
    return await queryState(id);
  }

  let ok = 0,
    sum = 0;

  async function expectJudge(src, lang, expect, cases, time = 1, memory = 64) {
    sum++;
    console.log(`\nTest ${src} using ${lang}`);
    const result = await httpJudge(src, lang, cases, time, memory);
    if (result.verdict === 6) result.message = b64decode(result.message);
    console.log(`Result:`);
    console.log(JSON.stringify(result, null, 2));
    if (expect === result.verdict) {
      ok++;
      console.log(`OK, Expect: ${expect}`);
    } else {
      console.log(`No, Expect: ${expect}, but get: ${result.verdict}`);
    }
  }

  // ac
  await expectJudge('ac.cpp', 'cpp', 0, cases);
  // tle
  await expectJudge('tle.cpp', 'cpp', 1, cases);
  // mle
  await expectJudge('mle.cpp', 'cpp', 3, cases);
  // ce
  await expectJudge('ce.cpp', 'cpp', 6, cases);
  // re
  await expectJudge('re.cpp', 'cpp', 4, cases);
  // wa
  await expectJudge('wa.cpp', 'cpp', -1, cases);
  // stack
  await expectJudge('stk.cpp', 'cpp', 0, cases);
  // testcase
  await expectJudge('ac.cpp', 'cpp', 9, ['wa']);
  // c
  await expectJudge('a.c', 'c', 0, cases);
  // c++14
  await expectJudge('ac.cpp', 'cc14', 0, cases);
  // c++17
  await expectJudge('ac.cpp', 'cc17', 0, cases);
  // python3
  await expectJudge('a.py', 'python', 0, cases);
  // python2
  await expectJudge('a.py2', 'py2', 0, cases);
  // java
  await expectJudge('Main.java', 'java', 0, cases);

  console.log(`\nTest finish: ${ok}/${sum}`);

  console.log(`\nHttp Stress test`);

  const tasks = [];
  tasks.push(httpJudge('ac.cpp', 'cpp', cases));
  tasks.push(httpJudge('tle.cpp', 'cpp', cases));
  tasks.push(httpJudge('wa.cpp', 'cpp', cases));
  tasks.push(httpJudge('ac.cpp', 'cpp', cases));
  tasks.push(httpJudge('tle.cpp', 'cpp', cases));
  tasks.push(httpJudge('wa.cpp', 'cpp', cases));
  tasks.push(httpJudge('ac.cpp', 'cpp', cases));
  tasks.push(httpJudge('tle.cpp', 'cpp', cases));
  tasks.push(httpJudge('wa.cpp', 'cpp', cases));

  let start = new Date().getTime();
  console.log(await axios.all(tasks));
  let end = new Date().getTime();

  console.log(`Test OK, done in ${end - start} ms\n`);

  console.log('Http Interactor Test');

  folder = 'binary';
  checker = {
    checker: {
      id: 'int_chk',
      lang: 'cpp'
    },
    interactor: {
      id: 'int',
      lang: 'cpp'
    }
  };
  ok = sum = 0;

  await expectJudge('ac.cpp', 'cpp', 0, casesBin);
  await expectJudge('ac.cc17', 'cc17', 0, casesBin);
  await expectJudge('ac.java', 'java', 0, casesBin);
  await expectJudge('ac.py3', 'python', 0, casesBin);
  await expectJudge('wa.cpp', 'cpp', -1, casesBin);
  await expectJudge('mle.cpp', 'cpp', 3, casesBin);
  await expectJudge('tleafter.cpp', 'cpp', 1, casesBin);
  await expectJudge('tleflush.cpp', 'cpp', 1, casesBin);
  await expectJudge('tlenotflush.cpp', 'cpp', 1, casesBin);

  console.log(`\nTest finish: ${ok}/${sum}`);
};
