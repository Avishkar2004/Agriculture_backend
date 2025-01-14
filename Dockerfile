# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /App

# Copy package.json and install dependencies
COPY package.json package-lock.json ./

RUN npm install

# Copy the rest of you application code
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Start your Node.js app
CMD [ "npm", "start" ]
