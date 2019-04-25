FROM ubuntu:18.10

RUN apt-get update \
    && apt-get install -y wget \
    && wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash \
    && bash ~/.nvm/nvm.sh

CMD ./run.sh

