FROM node:10-alpine AS dependencies
RUN apk update && \
    apk add yarn g++ make python --no-cache && \
    rm -rf /var/cache/apk/* && \
    mkdir -p /var/graph

WORKDIR /var/graph

COPY ./package.json /var/graph/package.json

RUN yarn --production

# --- Release Image ---
FROM node:10-alpine AS release
LABEL maintainer="requarks.io"

RUN apk update && \
    apk add bash curl git openssh supervisor --no-cache && \
    mkdir -p /var/graph && \
    mkdir -p /logs

WORKDIR /var/graph

COPY supervisord.conf /etc/supervisord.conf
COPY . /var/graph
COPY --from=dependencies /var/graph/node_modules ./node_modules

EXPOSE 3000

CMD ["supervisord", "--nodaemon", "-c", "/etc/supervisord.conf"]
