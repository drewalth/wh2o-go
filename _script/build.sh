cd client/ || exit

npm run build

cd ..

go build -o bin/main main.go

