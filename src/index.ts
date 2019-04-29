import app from './app'
import { cache } from './app'
import { b64decode, b64encode } from './util'
import { Verdict } from './config'

import Checker from './core/checker'
import judge from './core/judge'
import TestCase from './core/testcase'

app.get('/ping', (req, res) => {
  res.send('XLor Online Judge Core');
});

app.post('/upload/case/:id/:type', async (req, res) => {
  let id = req.params.id, type = req.params.type, content = req.body;
  if (type !== 'in' && type !== 'out') {
    res.sendStatus(400);
  } else {
    let c = new TestCase(id);
    // await c.write(type, content);
    c.write(type, content);
    res.send('OK');
  }
});

app.post('/upload/checker', async (req, res) => {
  let code: string = b64decode(req.body.code);
  let chk: Checker = new Checker(req.body.id, req.body.lang);
  // let flag: boolean = true;
  // await chk.compile(code, 30).catch((err) => {
  chk.compile(code, 30).catch((err) => {
    // flag = false;
    // res.send({ verdict: Verdict.CompileError, message: b64encode(err.message) });
  });
  // if (flag) res.send('OK');
  res.send('OK');
});

app.post('/judge', async (req, res) => {
  console.log('judging...');
  cache.set(req.body.id, { verdict: Verdict.Waiting }, 3600, err => {
    // console.error(err);
  });
  let code = b64decode(req.body.code);
  // let ans = await judge(req.body.id, code, req.body.lang, 
  judge(req.body.id, code, req.body.lang, 
    new Checker(req.body.checker.id, req.body.checker.lang), 
    req.body['max_time'], req.body['max_memory'], req.body.cases)
      .catch(err => { res.send({ verdict: Verdict.SystemError, message: err.message }) });
  // res.send(ans);
  res.send('OK');
});

app.get('/query', async (req, res) => {
  cache.get(req.query.id, (err, data) => {
    console.log(data);
    res.send(data);
  });
});

const server = app.listen(3000, '0.0.0.0', () => {
  console.log("Judger is running at http://localhost:%d in %s mode", 3000, app.get("env"));
});

export default server;