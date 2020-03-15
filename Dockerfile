FROM node:12.10.0
WORKDIR /app
COPY /src /app/src
COPY package.json /app
COPY tsconfig.json /app
RUN npm run build
COPY . /app
CMD npm run start
EXPOSE 3000