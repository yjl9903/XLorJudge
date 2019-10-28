const axios = require('axios');
const WebSocket  = require('ws');
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
const name = 'XLor';
const pass = 'whgtxdy';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Authorization": `Basic ${b64encode(name + ':' + pass)}`,
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
    }, 500);
  });
}

async function httpJudge(src, lang, cases = [], time = 1, memory = 64) {
  const id = random_string();
  await api.post('/judge', {
    id: id, 
    max_time: time, 
    max_memory: memory,
    cases: cases, 
    checker: { id: 'chk', lang: 'cpp' },
    lang: lang,
    code: b64encode(await fs.promises.readFile(path.join(__dirname, 'testcode', src), 'utf8'))
  });
  return await queryState(id);
}

function wsJudge(src, lang, cases = [], time = 1, memory = 64) {
  const url = `ws://${baseURL.replace(/^(http(s|):\/\/)/, '').replace(/(\/)$/, '')}/judge`;
  const ws = new WebSocket(url, {
    headers: {
      "Authorization": `Basic ${b64encode(name + ':' + pass)}`
    }
  });
  const send = async () => {
    const body = {
      id: random_string(), 
      max_time: time, 
      max_memory: memory,
      cases: cases, 
      checker: { id: 'chk', lang: 'cpp' },
      lang: lang,
      code: b64encode(await fs.promises.readFile(path.join(__dirname, 'testcode', src), 'utf8'))
    };
    ws.send(JSON.stringify(body));
  }
  ws.on('open', send);
  return new Promise((res, rej) => {
    ws.on('message', msg => {
      const obj = JSON.parse(msg);
      if (obj.status === 'error') {
        send();
        return ;
      }
      if (obj.verdict > -2) {
        ws.terminate();
        res(obj);
      }
    });
    ws.on('error', err => rej(err));
  });
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

  console.log(`\nStep 4: Http Judge test`);

  let okh = 0, sumh = 0, okw = 0, sumw = 0;

  async function expectJudge(src, lang, expect, cases, time = 1, memory = 64) {
    sumh++;
    console.log(`\nTest ${src} using ${lang}`);
    const result = await httpJudge(src, lang, cases, time, memory);
    if (result.verdict === 6) result.message = b64decode(result.message);
    console.log(`Result:`);
    console.log(JSON.stringify(result, null, 2));
    if (expect === result.verdict) {
      okh++;
      console.log(`OK, Expect: ${expect}`);
    } else {
      console.log(`No, Expect: ${expect}, but get: ${result.verdict}`);
    }
  }

  async function expectJudgeW(src, lang, expect, cases, time = 1, memory = 64) {
    sumw++;
    console.log(`\nTest ${src} using ${lang}`);
    const result = await wsJudge(src, lang, cases, time, memory);
    if (result.verdict === 6) result.message = b64decode(result.message);
    console.log(`Result:`);
    console.log(JSON.stringify(result, null, 2));
    if (expect === result.verdict) {
      okw++;
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

  console.log(`\nTest finish: ${okh}/${sumh}`);

  console.log(`\nStep 5: Stress test`);

  tasks.splice(0, tasks.length);
  tasks.push(httpJudge('ac.cpp', 'cpp', cases));
  tasks.push(httpJudge('tle.cpp', 'cpp', cases));
  tasks.push(httpJudge('wa.cpp', 'cpp', cases));
  tasks.push(httpJudge('ac.cpp', 'cpp', cases));
  tasks.push(httpJudge('tle.cpp', 'cpp', cases));
  tasks.push(httpJudge('wa.cpp', 'cpp', cases));

  const start = new Date().getTime();
  console.log(await axios.all(tasks));
  const end = new Date().getTime();
  
  console.log(`Test OK, done in ${(end - start)} ms`);

  console.log(`\nStep 6: Websocket Judge test`);

  await expectJudgeW('ac.cpp', 'cpp', 0, cases);
  await expectJudgeW('tle.cpp', 'cpp', 1, cases);
  await expectJudgeW('mle.cpp', 'cpp', 3, cases);
  await expectJudgeW('ce.cpp', 'cpp', 6, cases);
  await expectJudgeW('re.cpp', 'cpp', 4, cases);
  await expectJudgeW('wa.cpp', 'cpp', -1, cases);
  await expectJudgeW('stk.cpp', 'cpp', 0, cases);
  await expectJudgeW('ac.cpp', 'cpp', 9, ['wa']);

  console.log(`\nTest finish: ${okw}/${sumw}`);

  console.log('');
})();