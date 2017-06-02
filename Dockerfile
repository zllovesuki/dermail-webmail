FROM mhart/alpine-node:8.0.0

RUN apk add --no-cache git

RUN npm install pm2 -g

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm run prod \
 && npm prune --production

EXPOSE 3001

CMD pm2 start app.json --no-daemon
