const axios = require('axios');
const fs = require('fs');
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

const character_table = "0123456789abcdefghijklmnopqrstuvwxyz";
function random_string(length = 32) {
  return Array.apply(null, Array(length)).map(() => character_table[rand(0, character_table.length - 1)]).join('');
}

const baseURL = 'http://localhost:3000/';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Authorization": "Basic WExvcjp3aGd0eGR5",
    "Content-Type": "application/json"
  }
});

const cases = [];
const CaseNum = 5;

async function queryState(id) {
  return new Promise((resolve, reject) => {
    let loopid = setInterval(() => {
      api.get('/query', { params: { id: id } }).then(res => {
        if (res.data.verdict > -2) {
          clearInterval(loopid);
          resolve(res.data);
        }
      });
    }, 1000);
  });
}

async function judge(src, lang, cases = [], time = 1, memory = 64) {
  const id = random_string();
  await api.post('/judge', {
    id: id, 
    max_time: time, 
    max_memory: memory,
    cases: cases, 
    checker: { id: 'chk', lang: 'cpp' },
    lang: lang,
    code: b64encode(await fs.promises.readFile(src, 'utf8'))
  });
  return await queryState(id);
}

(async () => {
  console.log(`\nStart test XLor Judge on ${baseURL}`);

  console.log(`\nStep 1: Ping`);
  console.log((await api.get('/ping')).data);

  console.log(`\nStep 2: Upload checker`);
  await api.post('/checker', {
    id: 'chk',
    lang: 'cpp',
    code: b64encode(await fs.promises.readFile(path.join(__dirname, 'testcode', 'chk.cpp'), 'utf8'))
  });

  console.log(`\nStep 3: Upload testcase`);

  const tasks = [];
  for (let i = 0; i < CaseNum; i++) {
    const id = random_string();
    a = rand(0, 100000), b = rand(0, 100000);
    tasks.push(api.post(
      `/case/${id}/in`, 
      `${a} ${b}`, 
      { headers: { "Content-Type": "text/plain" } }
    ));
    tasks.push(api.post(
      `/case/${id}/out`, 
      `${a + b}`, 
      { headers: { "Content-Type": "text/plain" } }
    ));
    cases.push(id);
  }
  await axios.all(tasks);

  console.log(`\nStep 4: Judge test`);

  async function expectJudge(src, lang, expect, cases, time = 1, memory = 64) {
    console.log(`\nTest ${src} using ${lang}`);
    const result = await judge(path.join(__dirname, 'testcode', src), lang, cases, time, memory);
    if (result.verdict === 6) result.message = b64decode(result.message);
    console.log(`Result:`);
    console.log(JSON.stringify(result, null, 2));
    if (expect === result.verdict) {
      console.log(`OK, Expect: ${expect}`);
    } else {
      console.log(`No, Expect: ${expect}, but get: ${result.verdict}`);
    }
  }

  await expectJudge('a.cpp', 'cpp', 0, cases);
  await expectJudge('b.cpp', 'cpp', 1, cases);
  await expectJudge('c.cpp', 'cpp', 3, cases);
  await expectJudge('d.cpp', 'cpp', 6, cases);
  await expectJudge('e.cpp', 'cpp', 4, cases);
  await expectJudge('f.cpp', 'cpp', -1, cases);
  await expectJudge('a.cpp', 'cpp', 9, ['wa']);
  await expectJudge('a.c', 'c', 0, cases);
  await expectJudge('a.cpp', 'cc14', 0, cases);
  await expectJudge('a.cpp', 'cc17', 0, cases);
  await expectJudge('a.py', 'python', 0, cases);
  await expectJudge('a.py2', 'py2', 0, cases);
  await expectJudge('Main.java', 'java', 0, cases);
})();