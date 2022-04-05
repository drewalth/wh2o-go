#!/bin/bash

echo Bootstrapping Application...
cd client
echo Installing Frontend Dependencies...
npm ci --silent
echo Compiling Frontend files...
npm run --silent build
cd ..
go mod tidy