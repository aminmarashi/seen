FROM node

WORKDIR /opt

COPY package* ./

RUN npm install

COPY src/index.js ./
COPY src/views ./views

ENTRYPOINT ["/usr/bin/env", "node", "index.js"]
