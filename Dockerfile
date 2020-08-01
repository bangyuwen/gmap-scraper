FROM node:buster

WORKDIR /root

RUN  apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install --assume-yes google-chrome-stable

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .

VOLUME /root/data
CMD ["npm", "start"]