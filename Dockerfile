FROM node:18-alpine as build-image
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN npm ci
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=build-image /usr/src/app/dist ./dist
RUN npm ci --production
COPY . .
EXPOSE 8100
RUN npx prisma generate
CMD [  "npm", "run", "start:prod" ]
