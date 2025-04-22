# STAGE 1: Build
FROM node:22-alpine AS builder

# Accept build-time API URL
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

RUN npm run build

# STAGE 2: Serve
FROM nginx:alpine

# Install curl for healthchecks
RUN apk add --no-cache curl

# Set the working directory in the container to /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*

# Copy only the necessary files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration file
EXPOSE 80

# Build the application
CMD ["nginx", "-g", "daemon off;"]