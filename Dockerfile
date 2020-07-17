FROM ubuntu:20.04

# RUN sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.list

RUN apt-get update \
    && apt-get install -y wget git curl locales \
              python python3 gcc g++ openjdk-8-jdk libtool \
              make pkg-config bison flex \
              libprotobuf-dev protobuf-compiler libnl-3-dev libnl-route-3-dev libboost-all-dev \
    && locale-gen en_US.UTF-8 \
    && wget https://raw.githubusercontent.com/MikeMirzayanov/testlib/master/testlib.h -O /usr/local/include/testlib.h \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

ADD . /judge

WORKDIR /judge

ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

RUN yarn install --production=false \
    && yarn prebuild && yarn build \ 
    && mkdir -p /judge/run/submission /judge/run/temp /judge/run/data \
       /judge/run/checker /judge/run/interactor /judge/run/generator /judge/run/validator \
    && useradd -r compiler \
    && git submodule update --init --recursive && cd nsjail && make && mv nsjail /bin/nsjail && cd .. \
    && chmod +x run.sh

EXPOSE 3000

CMD ./run.sh
