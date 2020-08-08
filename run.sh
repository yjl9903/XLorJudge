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

chown compiler:compiler ./run/temp ./run/submission
chown compiler:compiler ./run/checker ./run/interactor ./run/generator ./run/validator

export NODE_ENV=PRODUCTION

yarn run start:prod
