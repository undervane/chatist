FROM node:lts-alpine

WORKDIR /app

COPY . /app

RUN apk --no-cache --virtual build-dependencies add \
  python \
  make \
  g++ \
  && npm install \
  && apk del build-dependencies \
  && npm run build

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && export NODE_ENV=production && node dist/main.js