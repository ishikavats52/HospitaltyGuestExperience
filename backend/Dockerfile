# Multi-Stage Dockerfile for Hospitality Platform Backend API
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Production Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules and source code
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Expose HTTP port
EXPOSE 5000

# Start production server
CMD ["node", "src/server.js"]
