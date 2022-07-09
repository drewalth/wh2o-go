#!/bin/zsh

export REACT_APP_API_BASE_URL=/api

cd client/
echo Installing frontend dependencies...
npm ci --silent
echo Building frontend...
npm run --silent build
cd ..
go mod tidy
echo Compiling target binaries...
make release-dry-run