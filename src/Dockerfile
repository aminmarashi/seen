FROM node

WORKDIR /opt

COPY package* index.js ./

RUN npm install

COPY views ./views

ENTRYPOINT ["/usr/bin/env", "node", "index.js"]
