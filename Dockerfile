FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build both client and server
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only
RUN npm install --production
RUN cd server && npm install --production

# Copy built files from build stage
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/build ./client/build

# Add server static file serving for client
COPY --from=build /app/server/src/static.ts ./server/src/
RUN echo "import express from 'express'; import path from 'path'; export const serveStatic = (app) => { app.use(express.static(path.join(__dirname, '../../client/build'))); app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '../../client/build', 'index.html')); }); };" > ./server/src/static.ts
RUN cd server && npx tsc src/static.ts --outDir dist --esModuleInterop true --skipLibCheck true

# Update server entry point to serve static files
RUN sed -i '/import dotenv/a import { serveStatic } from '\''./static'\''\\;' ./server/dist/index.js
RUN sed -i '/app\.listen/i serveStatic\(app\)\;' ./server/dist/index.js

# Expose port
ENV PORT=3010
EXPOSE 3010

# Start the server
CMD ["node", "server/dist/index.js"]