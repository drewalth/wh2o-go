#!/bin/zsh
echo bootstrapping application...
cd client
npm ci
npm run build
rm -rf node_modules
cd ..
go build main.go