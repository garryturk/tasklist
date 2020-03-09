FROM node:10.15-alpine

# install build tools
RUN apk add --no-cache make gcc g++ python

# Install global Dependencies
RUN npm install -g nodemon
RUN npm install -g forever

WORKDIR /application
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Remove build tools dependencies...
RUN apk del make gcc g++ python
VOLUME /application/code

# Expose the port which is used by the project.
EXPOSE 3000

CMD forever --spinSleepTime 10000 --minUptime 5000 -c "nodemon --exitcrash -L --watch /application/code" /application/bin/www
