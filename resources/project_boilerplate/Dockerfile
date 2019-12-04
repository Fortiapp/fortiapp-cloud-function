FROM node:alpine
LABEL maintainer="Fortiapp  <contact@fortiapp.com>"

EXPOSE 80 443 3000 43554

# Install pm2
RUN npm install pm2 -g

COPY . ./app
WORKDIR ./app

RUN npm install --production
RUN mkdir /app/functions/

CMD pm2-runtime ecosystem.config.js
