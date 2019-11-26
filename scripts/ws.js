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

module.exports = async function testWs(baseURL, name, pass, cases) {

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

  let ok = 0, sum = 0;

  async function expectJudgeW(src, lang, expect, cases, time = 1, memory = 64) {
    sum++;
    console.log(`\nTest ${src} using ${lang}`);
    const result = await wsJudge(src, lang, cases, time, memory);
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

  await expectJudgeW('ac.cpp', 'cpp', 0, cases);
  await expectJudgeW('tle.cpp', 'cpp', 1, cases);
  await expectJudgeW('mle.cpp', 'cpp', 3, cases);
  await expectJudgeW('ce.cpp', 'cpp', 6, cases);
  await expectJudgeW('re.cpp', 'cpp', 4, cases);
  await expectJudgeW('wa.cpp', 'cpp', -1, cases);
  await expectJudgeW('stk.cpp', 'cpp', 0, cases);
  await expectJudgeW('ac.cpp', 'cpp', 9, ['wa']);

  console.log(`\nTest finish: ${ok}/${sum}`);

  console.log(`\nWebSocket Stress test`);

  const tasks = [];
  tasks.push(wsJudge('ac.cpp', 'cpp', cases));
  tasks.push(wsJudge('tle.cpp', 'cpp', cases));
  tasks.push(wsJudge('wa.cpp', 'cpp', cases));
  tasks.push(wsJudge('ac.cpp', 'cpp', cases));
  tasks.push(wsJudge('tle.cpp', 'cpp', cases));
  tasks.push(wsJudge('wa.cpp', 'cpp', cases));
  tasks.push(wsJudge('ac.cpp', 'cpp', cases));
  tasks.push(wsJudge('tle.cpp', 'cpp', cases));
  tasks.push(wsJudge('wa.cpp', 'cpp', cases));

  let start = new Date().getTime();
  console.log(await axios.all(tasks));
  let end = new Date().getTime();
  
  console.log(`Test OK, done in ${(end - start)} ms\n`);
};