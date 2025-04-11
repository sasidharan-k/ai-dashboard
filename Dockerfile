# syntax=docker/dockerfile:1

FROM node:20-slim
ENV NODE_OPTIONS="--max-old-space-size=4096"

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

# Return to app root to run builds
WORKDIR /app

RUN npm install

# Final workdir should be the root
WORKDIR /app

EXPOSE 3000 3010

CMD ["npm", "start"]
