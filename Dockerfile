FROM node:lts-alpine

WORKDIR /app

COPY . /app

RUN npm install \
  && npm run build

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD wait && export NODE_ENV=production && node dist/main.js