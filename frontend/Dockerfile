FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build"]






