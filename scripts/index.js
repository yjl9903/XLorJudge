const axios = require('axios');
const fs = require('fs');
const path = require('path');

const testHttp = require('./http');
const testWs = require('./ws');

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

const baseURL = 'http://localhost:3000/';
const name = 'XLor';
const pass = 'whgtxdy';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: `Basic ${b64encode(name + ':' + pass)}`,
    'Content-Type': 'application/json'
  }
});

const casesAB = [];
const casesBin = [];
const CaseNum = 5;

(async () => {
  console.log(`\nStart test XLor Judge on ${baseURL}`);

  console.log(`\nStep 1: Ping`);
  console.log((await api.get('/ping')).data);

  console.log(`\nStep 2: Upload checker`);

  await api.post('/checker', {
    id: 'chk',
    lang: 'cpp',
    code: b64encode(
      await fs.promises.readFile(
        path.join(__dirname, 'aplusb', 'chk.cpp'),
        'utf8'
      )
    )
  });
  await api.post('/interactor', {
    id: 'int',
    lang: 'cpp',
    code: b64encode(
      await fs.promises.readFile(
        path.join(__dirname, 'binary', 'int.cpp'),
        'utf8'
      )
    )
  });
  await api.post('/checker', {
    id: 'int_chk',
    lang: 'cpp',
    code: b64encode(
      await fs.promises.readFile(
        path.join(__dirname, 'binary', 'chk.cpp'),
        'utf8'
      )
    )
  });

  console.log(`\nStep 3: Upload testcase`);

  const tasks = [];
  for (let i = 0; i < CaseNum - 1; i++) {
    const id = random_string();
    const a = rand(0, 100000),
      b = rand(0, 100000);
    tasks.push(
      (async () => {
        await api.post(`/case/${id}`, { in: `${a} ${b}\n` });
        await api.post(`/answer/${id}`, {
          lang: 'cpp',
          max_time: 2,
          max_memory: 128,
          code: b64encode(
            await fs.promises.readFile(
              path.join(__dirname, 'aplusb/ac.cpp'),
              'utf8'
            )
          )
        });
      })()
    );
    casesAB.push(id);
  }

  const BinData = ['12 20', '2 10', '1 1000000', '1000000 1000000', '1 1'];
  for (let i = 0; i < BinData.length; i++) {
    const id = random_string();
    tasks.push(
      (async () => {
        await api.post(`/case/${id}`, { in: BinData[i] });
        await api.post(`/answer/${id}`, {
          lang: 'cpp',
          max_time: 2,
          max_memory: 128,
          interactor: {
            id: 'int',
            lang: 'cpp'
          },
          code: b64encode(
            await fs.promises.readFile(
              path.join(__dirname, 'binary/ac.cpp'),
              'utf8'
            )
          )
        });
      })()
    );
    casesBin.push(id);
  }
  await Promise.all(tasks);

  console.log(`\nStep 4: Generator test`);

  let id = random_string();
  await api.post(`/generate/${id}`, {
    lang: 'cpp',
    code: b64encode(
      await fs.promises.readFile(path.join(__dirname, 'aplusb/gen.cpp'), 'utf8')
    ),
    args: [rand(0, 10000), rand(0, 10000)]
  });
  await api.post(`/answer/${id}`, {
    lang: 'cpp',
    max_time: 2,
    max_memory: 128,
    code: b64encode(
      await fs.promises.readFile(path.join(__dirname, 'aplusb/ac.cpp'), 'utf8')
    )
  });
  casesAB.push(id);

  console.log(`\nStep 5: Validator test`);

  tasks.splice(0, tasks.length);
  for (const id of casesAB) {
    tasks.push(
      api.post(`/validate/${id}`, {
        lang: 'cpp',
        code: b64encode(
          await fs.promises.readFile(path.join(__dirname, 'aplusb/val.cpp'), 'utf8')
        )
      })
    );
  }
  await Promise.all(tasks);

  let ans = 0;

  console.log(`\nStep 6: Http Judge test`);

  ans += await testHttp(api, casesAB, casesBin);

  console.log(`\nStep 7: WebSocket Judge test`);

  ans += await testWs(baseURL, name, pass, casesAB, casesBin);

  console.log(`\nStep 8: Clear Data`);

  tasks.splice(0, tasks.length);
  for (const id of casesAB) {
    tasks.push(
      api.delete(`/case/${id}`)
    );
  }
  for (const id of casesBin) {
    tasks.push(
      api.delete(`/case/${id}`)
    );
  }
  await Promise.all(tasks);

  console.log(`\nFinal test result: ${ans}/4\n`);
})();
