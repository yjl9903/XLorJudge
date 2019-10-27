FROM ubuntu:18.10

RUN apt-get update \
    && apt-get install -y wget git curl locales memcached \
              python python3 gcc g++ openjdk-8-jdk libtool \
              make pkg-config bison flex \
              libprotobuf-dev protobuf-compiler libnl-3-dev libnl-route-3-dev libboost-all-dev \
    && locale-gen en_US.UTF-8

ADD . /judge

WORKDIR /judge

ARG port=3000

ARG mode=production

ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8 NODE_ENV=${mode} PORT=${port}

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn && yarn install --production=false \
    && mkdir -p /judge/run/sub /judge/run/temp /judge/run/data /judge/run/checker \
    && useradd -r compiler \
    && wget https://raw.githubusercontent.com/MikeMirzayanov/testlib/master/testlib.h -O /usr/local/include/testlib.h \
    && git submodule update --init --recursive && cd nsjail && make && mv nsjail /bin/nsjail && cd .. \
    && chmod +x run.sh

EXPOSE ${port}

CMD ./run.sh
