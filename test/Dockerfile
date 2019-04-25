FROM ubuntu:18.10

RUN apt-get update \
    && apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs