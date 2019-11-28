import { Router } from 'express';
import multer, { diskStorage } from 'multer';
import path from 'path';

import { DATA_PATH } from '../configs';
import { Checker, Interactor, TestCase } from '../core';
import { b64decode, b64encode, random_string } from '../util';
import { Verdict } from '../verdict';
import Generator from './generator';

function checkCPP(lang) {
  if (lang === 'cpp') return true;
  if (lang === 'cc14') return true;
  if (lang === 'cc17') return true;
  return false;
}

const router = Router();

// Upload testcase input file
router.post('/case/:id', (req, res) => {
  const {
    params: { id, type = 'in' }
  } = req;

  // if (type !== 'in' && type !== 'ans') {
  //   res.sendStatus(400);
  // }

  const upload = multer({
    storage: diskStorage({
      destination(req, file, nxt) {
        nxt(null, path.join(DATA_PATH, id));
      },
      filename(req, file, nxt) {
        nxt(null, id + '.' + type);
      }
    })
  }).single(type);
  // filesize: 10 MB ?

  upload(req, res, async err => {
    if (req.file !== undefined) {
      if (err) {
        res.status(500).send({
          status: 'error',
          message: err.message
        });
      } else {
        res.send({
          status: 'ok'
        });
      }
    } else if (type in req.body) {
      const c = new TestCase(id);
      try {
        await c.write(type, req.body[type]);
        res.send({ status: 'ok' });
      } catch (err) {
        res.sendStatus(500);
      }
    } else {
      res.sendStatus(400);
    }
  });
});

// Delete testcase
router.delete('/case/:id', async (req, res) => {
  const c = new TestCase(req.params.id);
  await c.clear();
  res.send({ status: 'ok' });
});

// Use std to generate answer file
router.post('/answer/:id', async (req, res) => {
  const code = b64decode(req.body.code);
  const c = new TestCase(req.params.id);
  try {
    const result = await c.generateAns(
      code,
      req.body.lang,
      req.body.max_time,
      req.body.max_memory,
      'interactor' in req.body
        ? new Interactor(req.body.interactor.id, req.body.interactor.lang)
        : null
    );
    if (result.verdict === Verdict.Accepted) {
      res.send({
        status: 'ok'
      });
    } else {
      res.status(400).send({
        status: 'error',
        ...result
      });
    }
  } catch (err) {
    let message = err.message;
    if (err.code === 'ENOENT') {
      message = `${req.params.id}.in not exists`;
    }
    res.status(400).send({
      status: 'error',
      message
    });
  }
});

// Use generator to generate input file
router.post('/generate/:id', async (req, res) => {
  const code = b64decode(req.body.code);
  const gen = new Generator(random_string(), req.body.lang);
  const c = new TestCase(req.params.id);
  try {
    const result = await gen.generate(c, code, req.body.args);
    if (result.verdict === Verdict.Accepted) {
      res.send({
        status: 'ok'
      });
    } else {
      res.status(400).send({
        status: 'error',
        ...result
      });
    }
  } catch (err) {
    res.status(400).send({
      status: 'error',
      message: err.message
    });
  }
});

// Validate an input file
router.post('/validate/:id', async (req, res) => {});

router.post('/checker', async (req, res) => {
  if (!checkCPP(req.body.lang)) {
    return res.status(400).send({
      status: 'error',
      message: 'only allow cpp/cc14/cc17'
    });
  }

  const code = b64decode(req.body.code);
  const chk = new Checker(req.body.id, req.body.lang);
  try {
    await chk.compile(code, 30);
    res.send({ status: 'ok' });
  } catch (err) {
    const result = {
      verdict: Verdict.CompileError,
      message: b64encode(err.message)
    };
    if ('verdict' in err && err.verdict === Verdict.SystemError) {
      result.verdict = Verdict.SystemError;
    }
    res.status(400).send(result);
  }
});

router.post('/interactor', async (req, res) => {
  if (!checkCPP(req.body.lang)) {
    return res.status(400).send({
      status: 'error',
      message: 'only allow cpp/cc14/cc17'
    });
  }

  const code = b64decode(req.body.code);
  const int = new Interactor(req.body.id, req.body.lang);
  try {
    await int.compile(code, 30);
    res.send({ status: 'ok' });
  } catch (err) {
    const result = {
      verdict: Verdict.CompileError,
      message: b64encode(err.message)
    };
    if ('verdict' in err && err.verdict === Verdict.SystemError) {
      result.verdict = Verdict.SystemError;
    }
    res.status(400).send(result);
  }
});

export default router;
