# syntax=docker/dockerfile:1

FROM node:20-slim
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies required for canvas and puppeteer
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

# Install root dependencies
RUN npm install

# server setup
WORKDIR /app/server

COPY server/package.json server/package-lock.json ./

# Install server dependencies
RUN npm install

COPY server/tsconfig.json ./
COPY server/src ./src

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
RUN npm run build

WORKDIR /app/server

EXPOSE 3010

CMD ["npm", "start"]
