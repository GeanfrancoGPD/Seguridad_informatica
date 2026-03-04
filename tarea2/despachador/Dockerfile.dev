FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# El appuser es el usuario normal no root 
USER appuser 

EXPOSE 3001

CMD ["npm", "start"]