# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY . .

# Build application
RUN npm run build:orchestrator

# Remove development dependencies
RUN npm prune --omit=dev

# Install gtfstidy
FROM golang:1.27-alpine as gtfstidy
RUN apk add --no-cache git libc-dev
RUN go install github.com/patrickbr/gtfstidy@95d4796d9e7cf7d9a1257bfa6e18419571da01f8

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
