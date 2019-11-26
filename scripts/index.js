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
    code: b64encode(await fs.promises.readFile(path.join(__dirname, 'aplusb', 'chk.cpp'), 'utf8'))
  });
  await api.post('/checker', {
    id: 'int',
    lang: 'cpp',
    code: b64encode(await fs.promises.readFile(path.join(__dirname, 'binary', 'int.cpp'), 'utf8'))
  });
  await api.post('/checker', {
    id: 'int_chk',
    lang: 'cpp',
    code: b64encode(await fs.promises.readFile(path.join(__dirname, 'binary', 'chk.cpp'), 'utf8'))
  });

  console.log(`\nStep 3: Upload testcase`);

  const tasks = [];
  for (let i = 0; i < CaseNum; i++) {
    const id = random_string();
    let a = rand(0, 100000), b = rand(0, 100000);
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
    casesAB.push(id);
  }

  const BinData = [ 
    '12 20',
    '2 10',
    '1 1000000',
    '1000000 1000000',
    '1 1'
  ];
  for (let i = 0; i < BinData.length; i++) {
    const id = random_string();
    tasks.push(api.post(
      `/case/${id}/in`,
      `${BinData[i]}`,
      { headers: { "Content-Type": "text/plain" } }
    ));
    tasks.push(api.post(
      `/case/${id}/out`,
      `1`,
      { headers: { "Content-Type": "text/plain" } }
    ));
    casesBin.push(id);
  }
  await axios.all(tasks);

  console.log(`\nStep 4: Http Judge test`);

  await testHttp(api, casesAB, casesBin);

  console.log(`\nStep 5: WebSocket Judge test`);

  await testWs(baseURL, name, pass, casesAB, casesBin);

})();