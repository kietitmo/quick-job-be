FROM node:18

WORKDIR /usr/src/app

COPY ./package.json .

RUN npm install

EXPOSE 3333

#npm run start:dev
CMD [ "npm", "run", "start:dev" ]