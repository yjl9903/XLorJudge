docker build -t XLor-Judge .# XLor Judge

In development.

## Install

```
docker build -t xlor-judge .
docker run --name=judge -it -d --privileged -p 3000:3000 xlor-judge /bin/bash
```
