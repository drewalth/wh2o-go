#!/bin/zsh

cd ../client || exit
npm run build
cd ..
go run main.go
