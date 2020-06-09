#!/usr/bin/env bash                                                                                                                                                                                                                             

bucket='gs://web-scraper-config/config.json'

set -v

curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get update && apt-get install -yq git libgconf-2-4 nodejs
apt-get update && apt-get install -y wget --no-install-recommends

wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

apt-get update && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont --no-install-recommends

git clone https://github.com/sahava/web-scraper-gcp.git

cd web-scraper-gcp
sudo npm install
gsutil cp ${bucket} .
node index.js

shutdown -h now
