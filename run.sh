#!/bin/bash
if [ `id -u` -ne 0 ]; then
    echo "Please re-run ${this_file} as root."
    exit 1
fi

# core=$(grep --count ^processor /proc/cpuinfo)
# n=$(($core*2))

mkdir -p /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL
# chown root -R /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL
# chgrp root -R /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL

# chown compiler -R /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL
# chgrp compiler -R /sys/fs/cgroup/memory/NSJAIL /sys/fs/cgroup/cpu/NSJAIL /sys/fs/cgroup/pids/NSJAIL
chown compiler -R /sys/fs/cgroup/memory /sys/fs/cgroup/cpu /sys/fs/cgroup/pids
chgrp compiler -R /sys/fs/cgroup/memory /sys/fs/cgroup/cpu /sys/fs/cgroup/pids
chown compiler:compiler /Judge/dist/run/temp /Judge/dist/run/sub /Judge/dist/run/checker

# /bin/nsjail -Mo --chroot /Judge/dist/run/temp/up44dr2yru1ajsrl6cp8e8h4cymtuftz --user 65534 --group 65534 --log /Judge/dist/run/temp/sduahz5g4pbse82m1kijpcxhnpi4sntp/log --usage /Judge/dist/run/temp/sduahz5g4pbse82m1kijpcxhnpi4sntp/usage -R /bin -R /lib -R /lib64 -R /usr -R /sbin -R /dev -R /etc -R /Judge/dist/run/temp/31qpfnbyiq8qyk2nhy8tomh7399s3za9:/app -R /Judge/test/a.out:/app/a.out -D /app --cgroup_cpu_ms_per_sec 1000 --cgroup_pids_max 64 --cgroup_mem_max 33554432 -- ./a.out