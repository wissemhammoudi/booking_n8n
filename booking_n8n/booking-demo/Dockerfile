# ---- Build Stage ----
    FROM node:18-alpine AS builder
    WORKDIR /app
    
    # Copy only package files
    COPY package*.json ./
    RUN npm install
    
    # Copy the rest of the project
    COPY . .
    RUN npm run build
    
    # ---- Run Stage ----
    FROM node:18-alpine
    WORKDIR /app
    
    # Copy built app from builder
    COPY --from=builder /app ./
    
    ENV NODE_ENV=production
    ENV PORT=3000
    EXPOSE 3000
    
    CMD ["npm", "start"]
    