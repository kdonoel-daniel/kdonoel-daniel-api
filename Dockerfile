# bullseye required for gc-stats post build
FROM node:18.12.1-bullseye AS builder

WORKDIR /home/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY ./ ./

RUN yarn autoclean --force

ENV PORT 6686
ENV MONGODB_URI "mongodb://mongodb:27017/kdos"
ENV NODE_ENV "development"

RUN yarn run build

CMD ["yarn", "run", "dev"]

FROM node:18.12.1-alpine3.16

WORKDIR /home/app

COPY --from=builder /home/app/dist .
# copy yarn cache to allow yarn install to rerun offline
ARG YARN_CACHE_PATH=/usr/local/share/.cache/yarn/v6
COPY --from=builder ${YARN_CACHE_PATH} ${YARN_CACHE_PATH}

# TODO: fix this by migrating to yarn 2 : https://github.com/yarnpkg/yarn/issues/6373#issuecomment-760068356
RUN node -e "const package = require('./package.json'); delete package.devDependencies; require('fs').writeFileSync('package.json', JSON.stringify(package, null, 2));"

RUN yarn install --offline \
  && rm -rf test \
  && rm yarn.lock \
  && find . -type f -name "*.d.ts" -exec rm {} \; \
  && rm -rf ${YARN_CACHE_PATH}

CMD ["node", "index.js"]
