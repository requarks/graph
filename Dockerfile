FROM node:10-alpine AS base
LABEL maintainer="requarks.io"

RUN apk update && \
    apk add bash curl git openssh supervisor --no-cache && \
    mkdir -p /var/graph && \
    mkdir -p /logs

WORKDIR /var/graph

COPY supervisord.conf /etc/supervisord.conf
COPY . /var/graph

RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production

EXPOSE 3000

CMD ["supervisord", "--nodaemon", "-c", "/etc/supervisord.conf"]
