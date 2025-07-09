# Use the official Node.js image as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the source code from the current directory to the container
COPY . .

# Build the React app
RUN npm run build

# Expose port 5173 to the outside world
EXPOSE 5173

# Command to run the app
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
