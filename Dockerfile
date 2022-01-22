FROM node:16

WORKDIR /usr/yaufwot

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD [ "node", "source/index.js" ]