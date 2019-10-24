FROM ubuntu:18.10

RUN apt-get update \
    && apt-get install -y wget git curl locales memcached \
              python python3 gcc g++ openjdk-8-jdk libtool \
              make pkg-config bison flex \
              libprotobuf-dev protobuf-compiler libnl-3-dev libnl-route-3-dev libboost-all-dev \
    && locale-gen en_US.UTF-8 \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn && yarn

ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

ADD . /Judge

WORKDIR /Judge

RUN mkdir -p /Judge/dist/run/sub /Judge/dist/run/temp /Judge/dist/run/data /Judge/dist/run/checker

RUN useradd -r compiler \
    && wget https://raw.githubusercontent.com/MikeMirzayanov/testlib/master/testlib.h -O /usr/local/include/testlib.h \
    && git submodule update --init --recursive && cd nsjail && make && mv nsjail /bin/nsjail && cd .. \
    && chmod +x run.sh

EXPOSE 3000

CMD ./run.sh
