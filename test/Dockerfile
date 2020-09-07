FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

ADD . /judge

WORKDIR /judge

RUN apt-get update \
    && apt-get install -y \
              wget git curl locales apt-utils \
              python python3 gcc g++ openjdk-8-jdk libtool \
              make pkg-config bison flex \
              libprotobuf-dev protobuf-compiler libnl-3-dev libnl-route-3-dev libboost-all-dev \
    && locale-gen en_US.UTF-8

RUN wget https://raw.githubusercontent.com/MikeMirzayanov/testlib/master/testlib.h -O /usr/local/include/testlib.h \
    && git submodule update --init --recursive && cd nsjail && make && mv nsjail /bin/nsjail && cd .. \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

RUN yarn install --production=false \
    && yarn prebuild && yarn build \
    && mkdir -p ./run/submission ./run/temp ./run/data \
       ./run/checker ./run/interactor ./run/generator ./run/validator \
    && useradd -r compiler \
    && chmod +x ./test/run-test.sh

RUN ./test/run-test.sh
