# Use a Node image compatible with Angular 14+
FROM node:24-alpine

WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

EXPOSE 4200

# Start the Angular dev server
# --host 0.0.0.0 is required for Docker to expose the port to your local machine
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]