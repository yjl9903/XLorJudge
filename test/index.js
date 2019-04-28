const axios = require('axios');
const fs = require('fs');

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

ajax.get('/ping')
  .then(async res => {
    console.log('Step 1: ' + res.data);
    return ajax.post('/upload/checker', {
      id: 'chk',
      lang: 'cpp',
      code: b64encode(await fs.promises.readFile('/Judge/test/chk.cpp', 'utf8'))
    });
  })
  .then(async res => {
    console.log('Step 2: ' + res.data);
    const case_num = 10;
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
    let id = random_string();
    return ajax.post('/judge', {
      id: id, 
      max_time: 1, 
      max_memory: 64,
      cases: cases, 
      checker: { id: 'chk', lang: 'cpp' },
      lang: 'cpp',
      code: b64encode(await fs.promises.readFile('/Judge/test/a.cpp', 'utf8'))
    });
  })
  .then(res => {
    console.log('Final result:', res.data);
    console.log('Expected verdict: 0 / Accepted');
  })
  .catch(err => {
    console.error(err);
    throw(err);
  });