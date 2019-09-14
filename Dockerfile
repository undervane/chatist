FROM node:lts-alpine as build

# These layers are only re-built when package.* files are updated
COPY package-lock.json package.json /app/
WORKDIR /app/
# Install library dependencies
RUN npm install

# Copy the entire project and build it
# This layer is rebuilt when a file changes in the project directory
COPY . /app/
RUN npm run build
RUN npm prune --production

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

# This results in a single layer image
FROM node:lts-alpine
COPY --from=build /app /app
CMD wait && export NODE_ENV=development && node /app/dist/main.js