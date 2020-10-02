FROM node:14
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD /bin/sh -c "sleep 10; node server.js"
