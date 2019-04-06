FROM node:10-alpine AS dependencies
RUN apk update && \
    apk add yarn g++ make python --no-cache && \
    rm -rf /var/cache/apk/* && \
    mkdir -p /app

WORKDIR /app

COPY ./package.json /app/package.json

RUN yarn --production

# --- Release Image ---
FROM node:10-alpine AS release
LABEL maintainer="requarks.io"

RUN apk update && \
    apk add bash curl git openssh --no-cache && \
    mkdir -p /app && \
    mkdir -p /logs

WORKDIR /app

COPY . /app
COPY --from=dependencies /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "server"]
