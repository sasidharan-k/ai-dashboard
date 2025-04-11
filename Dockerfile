# syntax=docker/dockerfile:1

FROM node:20-slim
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN apt-get update && apt-get install -y \
  python3 \
  python-is-python3 \
  make \
  g++ \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  fonts-liberation \
  libfontconfig1 \
  chromium \
  && rm -rf /var/lib/apt/lists/*

# Add Puppeteer env vars
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# server

# server setup
WORKDIR /app/server

COPY server/package.json server/package-lock.json ./

# Install server dependencies
RUN npm install

COPY server/tsconfig.json ./
COPY server/src ./src

RUN npm run build

# client setup
WORKDIR /app/client

COPY client/package.json client/package-lock.json ./

# Install client dependencies
RUN npm install

COPY client/tsconfig.json ./
COPY client/src ./src
COPY client/public ./public

# client setup
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client/tsconfig.json ./
COPY client/src ./src
COPY client/public ./public
RUN npm run build

# move build to server
WORKDIR /app/server
RUN mkdir -p dist/public && cp -r /app/client/build/* dist/public/

# Return to app root to run builds
WORKDIR /app

RUN npm install

# Final workdir should be the root
WORKDIR /app

EXPOSE 3000 3010

CMD ["npm", "start"]
