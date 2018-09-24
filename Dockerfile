From node:10

RUN apt-get update && apt-get install -yq imagemagick sqlite3

COPY package*.json ./ 
RUN mkdir server/
COPY ./server/package*.json ./server/
RUN npm install --only=production
RUN cd server && npm install sqlite3@4.0.2 --build-from-source --sqlite=/usr/local --node_sqlite3_binary_host_mirror=https://npm.taobao.org/mirrors/ && npm install --only=production
RUN npm i -g pm2
COPY . .
EXPOSE 9013
CMD cd server && node bin/run
#CMD [ "npm", "start" ]
