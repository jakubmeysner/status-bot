FROM node:16-alpine
WORKDIR /app
COPY package*.json .
COPY prisma .
RUN [ "npm", "ci" ]
COPY . .
RUN [ "npm", "run", "build" ]
CMD [ "node", "dist/main.js" ]
