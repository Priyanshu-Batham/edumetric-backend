# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:22-alpine

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Expose app port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]