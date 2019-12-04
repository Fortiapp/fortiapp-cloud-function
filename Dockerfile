FROM node:alpine
LABEL maintainer="Fortiapp <contact@fortiapp.com>"

# Install pm2
RUN npm install pm2 -g

# Bundle APP files
COPY . /app
WORKDIR ./app

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

#build docker image for the function apps
#RUN docker image build -t function_app ./resources/project_boilerplate/Dockerfile

#expose port 5000 to the world
EXPOSE 5000

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]

FROM docker:dind
