# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=23.11.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# ---------- build stage ----------
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 \
    openssl

RUN npm install -g pnpm@10.12.1

# Install node modules
COPY package.json pnpm-lock.yaml ./


RUN pnpm install --no-frozen-lockfile

# Copy application code
COPY . .
RUN npx prisma generate


# ---------- final stage ----------    
FROM base AS runtime

# 1) installe juste pnpm et openssl pour faire tourner l’app (pas les toolchains)
RUN apt-get update -qq \
 && apt-get install --no-install-recommends -y openssl \
 && npm install -g pnpm@10.12.1 \
 && rm -rf /var/lib/apt/lists/*

# 2) copie l’app *avec* node_modules depuis build
COPY --from=build /app /app

# 3) expose le port
EXPOSE 3000

# 4) log clair si souhaité
ENV DEBUG_STARTUP=true

# 5) lance les migrations (une fois) puis l’app
CMD ["sh", "-c", "npx prisma migrate deploy && pnpm run start"]