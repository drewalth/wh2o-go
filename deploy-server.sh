#!/bin/zsh

echo Deploying server...

cd ..

rm -rf ./tmp
mkdir ./tmp

cp -r ./wh2o-next/ ./tmp/

rm -rf ./tmp/client

zip -r wh2o-next.zip ./tmp/

scp wh2o-next.zip pi@<foo_ip_address>:/home/pi/wh2o-next

rm -rf ./tmp/
rm -rf ./wh2o-next.zip

cd ./wh2o-next