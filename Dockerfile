# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose your server port (default Express port is often 3000 or 5000)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]