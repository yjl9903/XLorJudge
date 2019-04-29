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

const ajax = axios.create({
  baseURL: 'http://localhost:3000/',
  headers: {
    "Authorization": "Basic WExvcjp3aGd0eGR5",
    "Content-Type": "application/json"
  }
});

const cases = [];
let id = '';

async function queryState(id) {
  return new Promise((resolve, reject) => {
    let loopid = setInterval(() => {
      ajax.get('/query', { params: { id: id } }).then(res => {
        // console.log(res.data);
        if (res.data.verdict > -2) {
          clearInterval(loopid);
          resolve(res.data);
        }
      });
    }, 1000);
  });
}

async function judge(src, verdict, time = 1, memory = 64) {
  console.log(`\nJudge ${src}.cpp`);

  let id = random_string();
  return ajax.post('/judge', {
    id: id, 
    max_time: time, 
    max_memory: memory,
    cases: cases, 
    checker: { id: 'chk', lang: 'cpp' },
    lang: 'cpp',
    code: b64encode(await fs.promises.readFile(path.join(__dirname, `/${src}.cpp`), 'utf8'))
  }).then(async () => {
    console.log('Test result:', await queryState(id));
    console.log(`Expected verdict: ${verdict}`);
  });
}

ajax.get('/ping')
  .then(async res => {
    console.log('Step 1: ' + res.data);
    return ajax.post('/upload/checker', {
      id: 'chk',
      lang: 'cpp',
      code: b64encode(await fs.promises.readFile(path.join(__dirname, '/chk.cpp'), 'utf8'))
    });
  })
  .then(async res => {
    console.log('Step 2: ' + res.data);
    const case_num = 5;
    let tasks = [];
    for (let i = 0; i < case_num; i++) {
      let id = random_string(), a = rand(0, 100000), b = rand(0, 100000);
      tasks.push(ajax.post(
        `/upload/case/${id}/in`, 
        `${a} ${b}`,
        { headers: { "Content-Type": "text/plain" } }));
      tasks.push(ajax.post(
        `/upload/case/${id}/out`, 
        `${a + b}`,
        { headers: { "Content-Type": "text/plain" } }));
      
      cases.push(id);
    }
    return axios.all(tasks);
  })
  .then(async res => {
    console.log('Step 3:', res[0].data);

    id = random_string();
    return ajax.post('/judge', {
      id: id, 
      max_time: 1, 
      max_memory: 64,
      cases: cases, 
      checker: { id: 'chk', lang: 'cpp' },
      lang: 'cpp',
      code: b64encode(await fs.promises.readFile(path.join(__dirname, '/a.cpp'), 'utf8'))
    });
  })
  .then(async () => {
    console.log('Test result:', await queryState(id));
    console.log('Expected verdict: 0');
    // Time
    return judge('b', 2);
  })
  .then(async () => {
    // Memory
    return judge('c', 3);
  })
  .then(async () => {
    // Compile Error
    return judge('d', 6);
  })
  .then(async () => {
    // Runtime Error
    return judge('e', 4);
  })
  .then(async () => {
    // WA
    return judge('f', -1);
  })
  .catch(err => {
    console.error(err);
    throw(err);
  });