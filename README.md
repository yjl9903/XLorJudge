# XLor Judge

[![GitHub](https://img.shields.io/github/license/yjl9903/XLorJudge)](https://github.com/XLoJ/judge/blob/nest/LICENSE) [![Node CI](https://github.com/XLoJ/judge/workflows/Node%20CI/badge.svg)](https://github.com/XLoJ/judge/actions) [![Docker Image CI](https://github.com/XLoJ/judge/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/XLoJ/judge/actions)

:tada: XLorJudge v1.0 has now been released.

XLorJudge is a competitive programming contest judge core for XLor Online Judge. It can use uploaded testcase to run contestants' untrusted code in a reliable sandbox [nsjail](https://github.com/google/nsjail), and check if its result is correct with [testlib](https://github.com/MikeMirzayanov/testlib) (XLorJudge now fully supports testlib).

> :heavy_exclamation_mark: XLorJudge must run in Linux with a kernel vision higher than 4.15.

## Start

I highly recommend that you deploy XLorJudge with `docker`, because `docker` reduce the burden on environment configuration and you can easily deploy many XLorJudge.

Make sure that you have installed `docker` and `docker-compose`.

```bash
git clone https://github.com/yjl9903/XLorJudge.git
cd XLorJudge
docker-compose up -d
```

> Before running `docker-compose`, I recommend that you edit the configuration file `src/configs/token.ts` to change the username and password.

## Usage

XLorJudge will listen `3000` port.

You can run `npm run mytest` to check whether judge core is working.

## Docs

Docs is coming soon.

## To do

Detailed to do projects are in [projects](https://github.com/yjl9903/XLorJudge/projects).

## License

MIT © [XLor](https://xlor.cn)
