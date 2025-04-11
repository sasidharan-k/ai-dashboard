# AI Dashboard

A full-stack TypeScript application with a React frontend and Express backend for visualizing AI metrics.

## Local Development

### Prerequisites
- Node.js 20.x

### Installation
```bash
npm run install:all
```
#### Server Configurations
```

PORT = 3010 (required - default port)
OPENAI_API_KEY =  (required - the API key for your Open AI instance)
OCR_API_KEY
OPENAI_API_VERSION = (required - the API version of your Azure Open AI instance)

### Running locally
```bash
npm run build

npm start
```

This will start both the client on port 3000 and server on port 3010.

## Building for Production
```bash
npm run build
```

## Docker Build
```bash
docker build -t aidashboard .
docker run -p 8080:8080 aidashboard
```

## Deployment to GCP

### App Engine Deployment
```bash
gcloud app deploy
```

### Cloud Build (CI/CD)
Set up a Cloud Build trigger pointing to this repository, and it will automatically build and deploy using the cloudbuild.yaml configuration.

## Architecture
- Client: React with TypeScript
- Server: Express with TypeScript
- Deployment: Docker container on GCP App Engine
