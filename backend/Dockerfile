# Backend Dockerfile
FROM node:18-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev for potential build steps)
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3001/api/health || exit 1

# Start the server
CMD ["npm", "start"]
