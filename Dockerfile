FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y \
              wget git curl apt-utils \
              python python3 gcc g++ openjdk-8-jdk \
              libtool make pkg-config bison flex \
              libprotobuf-dev protobuf-compiler libnl-3-dev libnl-route-3-dev libboost-all-dev \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && wget https://raw.githubusercontent.com/MikeMirzayanov/testlib/master/testlib.h -O /usr/local/include/testlib.h

ADD . /judge

WORKDIR /judge

RUN git submodule update --init --recursive \
    && cd nsjail && make && mv nsjail /bin/nsjail && cd ..

RUN rm -rf node_modules \
    && yarn install --production=false \
    && yarn prebuild && yarn build \ 
    && mkdir -p /judge/run/submission /judge/run/temp /judge/run/data \
       /judge/run/checker /judge/run/interactor /judge/run/generator /judge/run/validator \
    && useradd -r compiler \
    && chmod +x run.sh \
    && chmod +x test/run-test.sh

EXPOSE 3000

CMD ./run.sh
