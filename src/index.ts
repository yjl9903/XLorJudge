import app from './app';

const server = app.listen(app.get('port'), '0.0.0.0', () => {
  console.log(
    'Judger is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env')
  );
});

export default server;
