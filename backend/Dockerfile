# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for florhema backend

# ============================================================
# STAGE 1: base — shared dependencies
# ============================================================
FROM node:22-alpine AS base
LABEL org.opencontainers.image.title="Florhema API"
LABEL org.opencontainers.image.description="Hemotherapy Management System Backend"
LABEL org.opencontainers.image.version="1.0.0"

RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files (validated by checksum in later stages)
COPY package.json package-lock.json* ./

# ============================================================
# STAGE 2: deps — install production dependencies only
# ============================================================
FROM base AS deps
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ============================================================
# STAGE 3: build — compile TypeScript
# ============================================================
FROM base AS build
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ============================================================
# STAGE 4: dev — hot-reload development
# ============================================================
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci --ignore-scripts && npm cache clean --force
COPY . .

USER appuser
EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# ============================================================
# STAGE 5: prod — production runtime (minimal)
# ============================================================
FROM node:22-alpine AS prod
LABEL org.opencontainers.image.title="Florhema API"
LABEL org.opencontainers.image.version="1.0.0"

RUN apk add --no-cache dumb-init ca-certificates tzdata \
  && addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only what's needed for production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY prisma/ ./prisma/

# Security hardening
RUN chown -R appuser:appgroup /app && chmod -R 755 /app

USER appuser
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

STOPSIGNAL SIGTERM

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--import", "./dist/instrumentation.js", "dist/server.js"]

# ============================================================
# STAGE 6: test — run tests
# ============================================================
FROM base AS test
ENV NODE_ENV=test
RUN npm ci --ignore-scripts && npm cache clean --force
COPY . .
USER appuser
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "test"]
