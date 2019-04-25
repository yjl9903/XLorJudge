```shell
docker run --name=judge2 -it -d --privileged -p 3000:3000 -v /d/5-Project/XLOJ/new/Judge:/Judge node-judge /bin/bash
```

# npm global

1. typescript

2. nodemon

1. pkg-config

# 部署

```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
nvm install 10.9
npm install -g typescript nodemon
```

```shell
docker run --name=judge3 -it -d --privileged -p 3000:3000 -v /sys:/sys node-judge /bin/bash
```

```
/bin/nsjail -Mo --chroot /Judge/dist/run/temp/up44dr2yru1ajsrl6cp8e8h4cymtuftz --set_cpus 1 --user 65534 --group 65534 --log /Judge/dist/run/temp/sduahz5g4pbse82m1kijpcxhnpi4sntp/log --usage /Judge/dist/run/temp/sduahz5g4pbse82m1kijpcxhnpi4sntp/usage -R /bin -R /lib -R /lib64 -R /usr -R /sbin -R /dev -R /etc -R /Judge/dist/run/temp/31qpfnbyiq8qyk2nhy8tomh7399s3za9:/app -R /Judge/test/a.out:/app/a.out -D /app --cgroup_cpu_ms_per_sec 1000 --cgroup_pids_max 64 --cgroup_mem_max 33554432 -- ./a.out
```

```
/bin/nsjail -Mo --chroot /usr/local/Judge/dist/run/temp/up44dr2yru1ajsrl6cp8e8h4cymtuftz --set_cpus 1 --user 65534 --group 65534 --log /usr/local/Judge/dist/run/temp/sduahz5g4pbse82m1kijpcxhnpi4sntp/log --usage /usr/local/Judge/dist/run/temp/sduahz5g4pbse82m1kijpcxhnpi4sntp/usage -R /bin -R /lib -R /lib64 -R /usr -R /sbin -R /dev -R /etc -R /usr/local/Judge/dist/run/temp/31qpfnbyiq8qyk2nhy8tomh7399s3za9:/app -R /Judge/test/a.out:/app/a.out -D /app --cgroup_cpu_ms_per_sec 1000 --cgroup_pids_max 64 --cgroup_mem_max 33554432 -- ./a.out
```