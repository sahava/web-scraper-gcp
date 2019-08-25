#!/usr/bin/env bash                                                                                                                                                                                                                             

bucket='gs://web-scraper-gcp/config.json'

set -v

curl -sL https://deb.nodesource.com/setup_11.x | bash -
apt-get update && apt-get install -yq git libgconf-2-4 nodejs
apt-get update && apt-get install -y wget --no-install-recommends

wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

apt-get update && apt-get install -y \
google-chrome-unstable \
fonts-ipafont-gothic \
fonts-wqy-zenhei \
fonts-thai-tlwg \
fonts-kacst \
ttf-freefont \
gconf-service \
libasound2 \
libatk1.0-0 \
libatk-bridge2.0-0 \
libc6 \
libcairo2 \
libcups2 \
libdbus-1-3 \
libexpat1 \
libfontconfig1 \
libgcc1 \
libgconf-2-4 \
libgdk-pixbuf2.0-0 \
libglib2.0-0 \
libgtk-3-0 \
libnspr4 \
libpango-1.0-0 \
libpangocairo-1.0-0 \
libstdc++6 \
libx11-6 \
libx11-xcb1 \
libxcb1 \
libxcomposite1 \
libxcursor1 \
libxdamage1 \
libxext6 \
libxfixes3 \
libxi6 \
libxrandr2 \
libxrender1 \
libxss1 \
libxtst6 \
ca-certificates \
fonts-liberation \
libappindicator1 \
libnss3 \
lsb-release \
xdg-utils \
wget \
--no-install-recommends

git clone https://github.com/sahava/web-scraper-gcp.git

cd web-scraper-gcp
sudo npm install
gsutil cp ${bucket} .
node index.js

shutdown -h now
