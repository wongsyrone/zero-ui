# Stage 1: Build frontend
FROM --platform=$BUILDPLATFORM node:lts-alpine AS frontend-build

ENV GENERATE_SOURCEMAP=false

# Enable corepack and create necessary directories in one layer
RUN corepack enable && mkdir -p /app/frontend

WORKDIR /app

# Copy package-related files and install dependencies
COPY tsconfig.json package.json yarn.lock* .yarnrc.yml ./
COPY .yarn/ ./.yarn

# Set working directory to frontend and copy package files
WORKDIR /app/frontend
COPY ./frontend/package*.json /app/frontend/

# Install frontend dependencies and build the frontend
RUN yarn workspaces focus frontend
COPY ./frontend /app/frontend/
RUN yarn build

# Stage 2: Build backend
FROM node:lts-alpine AS backend-build

# Enable corepack and create necessary directories in one layer
RUN corepack enable && mkdir -p /app/backend

WORKDIR /app

# Copy package-related files and install dependencies
COPY package.json yarn.lock* .yarnrc.yml ./
COPY .yarn/ ./.yarn

# Set working directory to backend and copy package files
WORKDIR /app/backend
COPY ./backend/package*.json /app/backend/

# Install backend dependencies
RUN yarn workspaces focus --production backend && yarn cache clean

# Copy the backend source files
COPY ./backend /app/backend

# Final Stage: Production
FROM node:lts-alpine

# Set the working directory to /app/backend
WORKDIR /app/backend

# Copy the built frontend from the frontend-build stage
COPY --from=frontend-build /app/frontend/build /app/frontend/build

# Copy the backend files from the backend-build stage
COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /app/node_modules /app/backend/node_modules

# Environment variables
ENV NODE_ENV=production
ENV ZU_SECURE_HEADERS=true
ENV ZU_SERVE_FRONTEND=true

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["node", "bin/www.js"]