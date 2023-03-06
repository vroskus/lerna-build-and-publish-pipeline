FROM node:16-alpine

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV NODE_TLS_REJECT_UNAUTHORIZED 0

RUN apk add --update --no-cache git docker-cli python3 make g++
RUN rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

RUN git config --global user.name "Local pipeline"
RUN git config --global user.email "local@pipeline.run"

RUN yarn global add lerna dotenv
