FROM node:18 AS build

WORKDIR /app
# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use a lightweight Node.js runtime for serving the app
FROM node:18-slim

# Copy the built app from the build stage to this stage
COPY --from=build /app/build ./build

# Install a simple HTTP server
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 5000

# Command to run the app
CMD ["serve", "-s", "build", "-l", "5000"]