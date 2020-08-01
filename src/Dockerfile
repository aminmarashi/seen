FROM node

WORKDIR /opt

COPY package* ./

RUN npm install

COPY index.js ./

COPY views ./views

ENTRYPOINT ["/usr/bin/env", "node", "index.js"]
