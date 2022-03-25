#!/bin/zsh

echo Deploying client...

mkdir tmp

cp -r ./client/ ./tmp

rm -rf ./tmp/node_modules
rm -rf ./tmp/src
zip -r client.zip ./tmp/
scp client.zip pi@<foo_ip_address>:/home/pi/wh2o-next/
rm -rf client.zip
cd client
npm ci
cd ..
echo done...