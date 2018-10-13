From node:10

RUN apt-get update && apt-get install -yq imagemagick sqlite3 g++ gcc

COPY package*.json ./ 
RUN mkdir server/
COPY ./server/package*.json ./server/
RUN npm install
COPY . .
RUN npm run build
RUN cd server && npm install --only=production

EXPOSE 9016
CMD cd server && node bin/run

