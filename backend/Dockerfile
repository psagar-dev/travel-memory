# Stage 1: Install Deps & build
FROM node:22-alpine AS builder

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code to the working directory
COPY . .

# remove devDependencies
RUN npm prune --production

# Stage 2: Runtime: only prod artifacts on Alpine
#FROM node:lts-alpine as production
FROM node:22-alpine AS production

# Set the working directory in the container to /app
WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Build the application
EXPOSE 3001

# CMd to run the application
CMD ["npm", "start"]