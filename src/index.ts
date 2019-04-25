import app from './app'
import { cache } from './app'
import { b64decode, b64encode, random_string, make_temp_dir, exec } from './util'
import { RUN_PATH, Verdict } from './config'
import { promises } from 'fs'

import os from 'os'
import path from 'path'

import basicAuth from 'basic-auth'

import Submission from './core/submission'
import Checker from './core/checker'
import judge from './core/judge'
import TestCase from './core/testcase'
import * as tokens from './configs/token.json'

app.all('/*', (req, res, nxt) => {
  if (req.url === '/ping') {
    nxt(); return ;
  }
  let auth = basicAuth(req);
  if (auth.name === tokens['username'] && auth.pass === tokens['password']) {
    nxt();
  } else {
    res.sendStatus(401);
  }
});

app.get('/ping', (req, res) => {
  console.log('ping...');
  res.send('XLor Online Judge Core');
});

app.post('/upload/case/:id/:type', async (req, res) => {
  let id = req.params.id, type = req.params.type, content = req.body;
  // console.log(id, type, content);
  if (type !== 'in' && type !== 'out') {
    res.sendStatus(400);
  } else {
    let c = new TestCase(id);
    await c.write(type, content);
    res.send('OK');
  }
});

app.post('/upload/checker', async (req, res) => {
  let code: string = b64decode(req.body.code);
  let chk: Checker = new Checker(req.body.id, req.body.lang);
  let flag: boolean = true;
  await chk.compile(code, 30).catch((err) => {
    flag = false;
    res.send({ verdict: Verdict.CompileError, message: b64encode(err.message) });
  });
  if (flag) res.send('OK');
});

app.post('/judge', async (req, res) => {
  console.log('judging...');
  cache.set(req.body.id, { verdict: Verdict.Waiting }, 3600, err => {
    // console.error(err);
  });
  let code = b64decode(req.body.code);
  let ans = await judge(req.body.id, code, req.body.lang, 
    new Checker(req.body.checker.id, req.body.checker.lang), 
    req.body['max_time'], req.body['max_memory'], req.body.cases);
  res.send(ans);
});

app.get('/query', async (req, res) => {
  cache.get(req.body.id, (err, data) => {
    res.send(data);
  });
});

(async function() {
  // console.log('async!');
  // let d = await make_temp_dir();
  // console.log(d);
  // await exec('echo', ['Hello!'], { stdio: ['ignore', await promises.open('out.txt', 'w'), 'ignore'] });
  // console.log(await )
  // console.log(os.userInfo());
  // let x = new Submission('cpp');
  // let ans = await x.run(RUN_PATH, '/Judge/dist/run/a.out', [], false, 5, 128, null, null, null);
  // console.log(ans);
  // let ans2 = await x.run(RUN_PATH, '/Judge/dist/run/b.out', [], false, 5, 128, null, null, null);
  // console.log(ans);
  // let ans = await x.run(RUN_PATH, '/usr/bin/g++', ['-static', '-lm', 'foo.cpp', '-o', 'c.out'], true, 5, 128, null, path.join(RUN_PATH, 'log.txt'), path.join(RUN_PATH, 'log.txt')); 
  // console.log(ans);
})()

const server = app.listen(3000, '0.0.0.0', () => {
  console.log("Judger is running at http://localhost:%d in %s mode", 3000, app.get("env"));
});

export default server;