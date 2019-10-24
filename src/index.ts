import app from './app';

const server = app.listen(app.get('port'), '0.0.0.0', () => {
  console.log(
    '\n  XLorJudge is running at http://localhost:%d in %s mode\n',
    app.get('port'),
    app.get('env')
  );
});

export default server;
