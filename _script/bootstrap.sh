#!/bin/bash

echo Installing Git Hooks

cp ./_git-hooks/pre-commit.sh .git/hooks/

echo Bootstrapping Application...
cd client || exit
echo Installing Frontend Dependencies...
npm ci --silent
echo Compiling Frontend files...
npm run --silent build
cd ..
go mod tidy