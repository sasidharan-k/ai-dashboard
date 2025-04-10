# syntax=docker/dockerfile:1

FROM socrata/runit-nodejs-focal:20x
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=secret,required=true,id=npmrc,target="/root/.npmrc" \
  npm install

# server

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./

COPY server/tsconfig.json ./

COPY server/src ./src

# client

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./

COPY client/tsconfig.json ./

COPY client/src ./src

COPY client/public ./public

WORKDIR /app

RUN --mount=type=secret,required=true,id=npmrc,target="/root/.npmrc" \
  npm run build

WORKDIR /app/server

EXPOSE 3010

CMD ["npm", "start"]
