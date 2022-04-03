# wh2o-next

Dashboard and custom notifications via Email or SMS for USGS river gages built with Go and JavaScript.

#### Nextjs

If you'd prefer not to work with Go, checkout the [NextJs Branch](https://github.com/drewalth/wh2o-next/tree/nextjs).

## Requirements

- [Golang](https://go.dev/)
- [Nodejs](https://nodejs.org/en/)
- [Mailgun Account (Optional - Free)](https://www.mailgun.com/)
- [Twilio Account (Optional - Almost Free)](https://www.twilio.com/docs/sms)

You do not _need_ either a Mailgun or a Twilio account to use the app. You can still view aggregate gage readings from your bookmarked apps without creating new accounts. Similarly, if you'd like to use different email or sms client, just swap out the Mailgun and Twilio usages + config with your preferred library.

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
