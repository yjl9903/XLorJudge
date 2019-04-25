FROM ubuntu:18.10

RUN apt-get update \
    && apt-get install -y wget bison flex locales \
              python python3 gcc g++ make libtool pkg-config \
              libboost-all-dev libprotobuf-dev protobuf-compiler libnl-3-dev libnl-route-3-dev \
    && locale-gen en_US.UTF-8 \
    && wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash \
    && . ~/.nvm/nvm.sh

ADD . /Judge
WORKDIR /Judge
RUN mkdir -p /dist/run/sub /dist/run/log /dist/run/temp

ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

RUN useradd -r compiler \
    && wget https://raw.githubusercontent.com/MikeMirzayanov/testlib/master/testlib.h -O /usr/local/include/testlib.h \
    && chmod +x run.sh

RUN cd nsjail && make && mv nsjail /bin/nsjail && cd ..

EXPOSE 3000

CMD ./run.sh

