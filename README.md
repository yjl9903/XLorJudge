# XLor Judge

[![Build Status](https://travis-ci.com/yjl9903/XLorJudge.svg?token=yA9RS9wdcppy1BXxiyCQ&branch=master)](https://travis-ci.com/yjl9903/XLorJudge)

In development.

## Install

```bash
git clone https://github.com/yjl9903/XLorJudge.git
cd XLorJudge
docker build -t xlor-judge .
docker run --name=judge -d --privileged -p 3000:3000 xlor-judge
```
