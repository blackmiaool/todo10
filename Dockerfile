From node:10

RUN apt-get update && apt-get install -yq imagemagick sqlite3 g++ gcc

COPY package*.json ./ 
RUN mkdir server/
COPY ./server/package*.json ./server/
RUN npm install --only=production
RUN cd server && npm install --only=production
RUN npm i -g pm2
COPY . .
EXPOSE 9013
CMD cd server && node bin/run
#CMD [ "npm", "start" ]
