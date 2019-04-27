FROM ubuntu:18.10

RUN apt-get update \
    && apt-get install -y wget curl bison flex locales memcached \
              python python3 gcc g++ make libtool pkg-config \
              libboost-all-dev libprotobuf-dev protobuf-compiler libnl-3-dev libnl-route-3-dev \
    && locale-gen en_US.UTF-8 \
    && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs 

ADD . /Judge
WORKDIR /Judge
RUN mkdir -p /Judge/dist/run/sub /Judge/dist/run/temp /Judge/dist/run/data /Judge/dist/run/checker

ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

RUN useradd -r compiler \
    && wget https://raw.githubusercontent.com/MikeMirzayanov/testlib/master/testlib.h -O /usr/local/include/testlib.h \
    && npm install -g typescript && npm install . \
    && chmod +x run.sh

RUN cd nsjail && make && mv nsjail /bin/nsjail && cd ..

EXPOSE 3000

CMD ./run.sh

