import basicAuth from 'basic-auth';
import bodyParser from 'body-parser';
import express from 'express';
import expressWs from 'express-ws';

const app = express();
expressWs(app);

import tokens from './configs/token';
import router from './router';

app.set('port', process.env.PORT ? process.env.PORT : 3000);

app.use(bodyParser.json());

// app.use((req, res, next) => {
//   // parse text/plain
//   if (req.is('text/*')) {
//     req.body = '';
//     req.setEncoding('utf8');
//     req.on('data', chunk => (req.body += chunk));
//     req.on('end', next);
//   } else {
//     next();
//   }
// });

app.all('/*', (req, res, nxt) => {
  const auth = basicAuth(req);
  if (
    auth &&
    auth.name === tokens['username'] &&
    auth.pass === tokens['password']
  ) {
    nxt();
  } else {
    res.sendStatus(401);
  }
});

app.get('/ping', (req, res) => {
  res.send('XLor Online Judge Core');
});

app.use(router);

export default app;
