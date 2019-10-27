# XLor Judge

[![Build Status](https://travis-ci.com/yjl9903/XLorJudge.svg?token=yA9RS9wdcppy1BXxiyCQ&branch=master)](https://travis-ci.com/yjl9903/XLorJudge) ![GitHub](https://img.shields.io/github/license/yjl9903/XLorJudge)

In development.

XLorJudge is a competitive programming contest judge core for XLor Online Judge. It can use uploaded testcase to judge contestants' untrusted code in a reliable sandbox.

> XLorJudge must run in Linux with a kernel vision higher than 4.15.

## Start

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

## License

MIT © [XLor](https://xlor.cn)
