FROM node:14
WORKDIR /root/fcfs-bot
SHELL ["/bin/bash", "-c"]

COPY package.json ./
COPY yarn.lock ./

RUN apt-get update
RUN apt install -y yarn
RUN yarn install --production=true
RUN yarn global add pm2

COPY scripts/update.sh /usr/local/bin/update
RUN chmod +x /usr/local/bin/update

COPY . .

CMD ["pm2-runtime", "start", "--name", "fcfs-bot", "/root/fcfs-bot/lib/index.js"]