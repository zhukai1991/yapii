FROM node:12-alpine3.14

RUN apk add binutils-gold g++ gcc gnupg libgcc linux-headers make python2

# if you want to develop in docker container
# RUN apk add openssh git

EXPOSE 4000
