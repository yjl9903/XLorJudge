import path from 'path';

import { Router } from 'express';
import multer, { diskStorage } from 'multer';

import { DATA_PATH } from '../configs';
import { TestCase, Checker, Interactor } from '../core';
import { Verdict } from '../verdict';
import { b64decode, b64encode } from '../util';

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
    await c.generateAns(
      code,
      req.body.lang,
      req.body.max_time,
      req.body.max_memory
    );
    res.send({
      status: 'ok'
    });
  } catch (err) {
    res.status(400).send({
      status: 'error',
      message: err.message
    });
  }
});

// Use generator to generate input file
router.post('/generate/:id', async (req, res) => {});

// Validate an input file
router.post('/validate/:id', async (req, res) => {});

router.post('/checker', async (req, res) => {
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
