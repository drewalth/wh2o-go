# wh2o-next

Email and SMS notifications for USGS river gages built with Go and React.

```bash
|-server (Go + Gin)
  |-client (React / Static Files)
```

## Requirements

- [Golang](https://go.dev/)
- [Nodejs](https://nodejs.org/en/)

## Development

- Clone repo
- `cd client`
- Install React dependencies: `npm ci`
- Build frontend for development + start dev server: `npm start`
- `cd ..`
- Install Go dependencies: `go get ./...`
- Start server: `go run main.go`

## Production

- `cd client`
- Install React dependencies: `npm ci`
- Build frontend: `npm run build`
- `cd ..`
- Compile: `go build`

The Go API will server static React files from the `client/build/` directory.