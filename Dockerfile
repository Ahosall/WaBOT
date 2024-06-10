FROM node:latest-slim

WORKDIR /usr/src/bot

COPY package.json ./package.json
RUN npm install --production

COPY dist/ ./dist/
COPY auth/ ./auth/

CMD ['npm', 'start']

