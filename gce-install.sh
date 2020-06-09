#!/usr/bin/env bash

bucket='gs://web-scraper-config/config.json'

set -v

apt-get update
apt-get install -y chromium
apt-get install -y libgbm-dev

curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -yq git libgconf-2-4 nodejs

git clone https://github.com/sahava/web-scraper-gcp.git

cd web-scraper-gcp
sudo npm install
gsutil cp ${bucket} .
node index.js

shutdown -h now
