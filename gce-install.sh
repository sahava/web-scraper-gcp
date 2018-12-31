#!/usr/bin/env bash

bucket='gs://web-scraper-config/config.json'

set -v

apt-get update && apt-get install -yq git libgconf-2-4
apt-get update && apt-get install -y wget --no-install-recommends

wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

apt-get update && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont --no-install-recommends

rm -rf /var/lib/apt/lists/*
apt-get purge --auto-remove -y curl
rm -rf /src/*.deb

mkdir /opt/nodejs
curl https://nodejs.org/dist/latest/node-v11.6.0-linux-x64.tar.gz | tar vxzf - -C /opt/nodejs --strip-components=1
ln -s /opt/nodejs/bin/node /usr/bin/node
ln -s /opt/nodejs/bin/npm /usr/bin/npm

git clone https://github.com/sahava/web-scraper-gcp.git

cd web-scraper-gcp
npm install
gsutil cp ${bucket} .
node index.js

shutdown -h now
