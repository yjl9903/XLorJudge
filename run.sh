#!/bin/bash
if [ `id -u` -ne 0 ]; then
    echo "Please re-run ${this_file} as root."
    exit 1
fi

mkdir -p /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL
chown root -R /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL
chgrp root -R /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL

chown compiler -R /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL
chgrp compiler -R /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL
chown compiler:compiler /judge/run/temp /judge/run/sub /judge/run/checker

memcached -p 11211 -u compiler -m 64m -d
yarn run start
