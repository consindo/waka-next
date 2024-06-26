# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.4.0
FROM node:${NODE_VERSION}-alpine as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install node modules
COPY --link package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY --link . .

# Build application
RUN npm run build:orchestrator

# Remove development dependencies
RUN npm prune --omit=dev

# Install gtfstidy
FROM golang:1.18-alpine as gtfstidy
RUN apk add --no-cache git libc-dev
RUN go install github.com/patrickbr/gtfstidy@25d4d6d1079a5926d9a558546bbe36d5b4cdb45f

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app/package.json /app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/orchestrator/build /app

# Copy gtfstidy
COPY --from=gtfstidy /go/bin/gtfstidy /bin

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "node", "index.js" ]
