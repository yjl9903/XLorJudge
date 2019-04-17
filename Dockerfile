FROM ubuntu:18.10

RUN apt-get update \
    && apt-get install -y wget bison flex locales \
              python python3 gcc g++ make libtool \
              libboost-all-dev libprotobuf-dev protobuf-compiler libnl-3-dev libnl-route-3-dev \
    && locale-gen en_US.UTF-8

ADD . /judge
WORKDIR /judge
RUN mkdir -p run/sub run/log run/temp

ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

RUN useradd -r compiler \
    && wget https://raw.githubusercontent.com/MikeMirzayanov/testlib/master/testlib.h -O /usr/local/include/testlib.h \
    && wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash \
    && source ~/.nvm/nvm.sh && nvm install 10.9 \
    && chmod +x run.sh

RUN git submodule update --init --recursive && cd nsjail && make && cd ..

EXPOSE 3000

CMD ./run.sh

