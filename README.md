# XLor Judge

In development.

## Install

```
git clone git@github.com:yjl9903/XLorJudge.git
cd XLorJudge
docker build -t xlor-judge .
docker run --name=judge -it -d --privileged -p 3000:3000 xlor-judge /bin/bash
```
