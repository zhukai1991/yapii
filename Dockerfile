FROM node:12-alpine3.14

RUN apk add binutils-gold g++ gcc gnupg libgcc linux-headers make python2

WORKDIR /app
COPY . /app
RUN npm install --production
CMD ['node', 'server/app.js']
