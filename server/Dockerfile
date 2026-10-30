# -----------------------------------------------------------------------------
# Production Multi-Stage Dockerfile for Rently Fastify Backend API
# Optimized for Google Cloud Run (Container-as-a-Service, autoscale 0..N)
# -----------------------------------------------------------------------------

FROM node:22-alpine AS runner

WORKDIR /app

# Ensure production environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy server code
COPY src ./src

# Expose Google Cloud Run standard port
EXPOSE 8080

# Run container as non-root user
USER node

# Healthcheck for container liveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start the server
CMD ["node", "--import", "tsx", "src/index.ts"]
