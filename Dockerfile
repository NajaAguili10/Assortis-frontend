# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cache friendly)
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Lightweight static server for serving build output (removes nginx dependency)
WORKDIR /app

# Install a minimal static server globally
RUN npm install -g http-server

# Copy built SPA assets from builder
COPY --from=builder /app/dist ./dist

# Expose the port the static server will listen on
EXPOSE 80

# Start a simple static file server serving the built SPA
CMD ["http-server", "dist", "-p", "80", "-c-1"]
