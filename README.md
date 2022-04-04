# wh2o-next

Dashboard and custom notifications via Email or SMS for USGS river gages built with Go and JavaScript.

![Alert Dashboard](/client/public/wh2o-next-alert-01.png)

## Features

- Daily Reports. Get an email once a day at a specified time summarizing your bookmarked gages.
- Immediate Alerts. Setup a notification to send you an SMS message when your favorite local creek is at prime flow.
- Dashboard. View all your bookmarked gages and their latest readings in one spot.

## To-Do

- [x] embed json assets into dist binary. See [`gages.HandleGetGageSources`](/core/gages/gages.go) and [`lib`](/core/lib/).
- [x] embed static frontend files into dist binary.
- [ ] setup goreleaser or some other auto semver service

## FAQ

<details>
<summary>
I cannot find the gage I am looking for. How can I add one?
</summary>

If you cannot find a USGS gage in the set, you can manually insert the gage's site number in the input when adding a bookmark. Alternatively, you can add the gage to the source JSON file. See all [gage sources](/core/lib/sources).

![USGS Page](/client/public/wh2o-next-gage-site-01.png)

</details>

## Nextjs

If you'd prefer not to work with Go and just JavaScript/Nodejs, check out the [NextJs Branch](https://github.com/drewalth/wh2o-next/tree/nextjs). Note that this version of the app is no longer being actively worked on.

## Requirements

- [Git](https://git-scm.com/)
- [Golang](https://go.dev/)
- [Nodejs](https://nodejs.org/en/)
- [Mailgun Account (Optional - Free)](https://www.mailgun.com/)
- [Twilio Account (Optional - Almost Free)](https://www.twilio.com/docs/sms)

You do not _need_ either a Mailgun or a Twilio account to use the app. You can still view aggregate gage readings from your bookmarked gages without going through the hassle of creating new accounts. Similarly, if you'd like to use a different email or SMS client, just swap out the Mailgun and Twilio usages + config with your preferred library.

## Getting Started

1. `git clone https://github.com/drewalth/wh2o-next.git`
2. `cd wh2o-next/`
3. Make scripts executable.

```sh
$ chmod +x ./script/bootstrap.sh
$ chmod +x ./script/server.sh
```

4. Install dependencies then build server and frontend.

```sh
$ ./script/bootstrap.sh
```

5. Start the server

```sh
$ ./script/server.sh
```

### Config

Depending on where you're running the application, on your main computer or somewhere else, you may need to change the Axios config for the frontend. For example, if you're running this on a Raspberry Pi, then you'll need to change the `baseUrl` to the Pi's IP Address.

1. Get your Pi's local IP address:

```sh
$ ifconfig
```

2. Edit [Axios config](/client/src/lib/http.ts):

```ts
const config: AxiosRequestConfig = {
  baseURL: 'http://<machine_ip_address>:3000/api'
}
```

3. Rebuild.

```sh
$ ./script/bootstrap.sh
```

## Updating

1. Make update script executable:

```sh
$ chmod +x ./script/update.sh
```

2. Run update script:

```sh
$ ./script/update.sh
```

## Backup Data

If you'd like to backup data to Dropbox or something else, change the file path for the sqlite database in [`database.go`](/database/database.go).

### Cross-Platform Compilation

If compiling the server for `arm64` you will want to run the `bootstrap` script on the machine. I know [it is possible](https://mansfield-devine.com/speculatrix/2019/02/go-on-raspberry-pi-simple-cross-compiling/) to compile specifically for `arm64` on another machine, but so far I have not had much success.

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

## Screenshots

##### Gage Dashboard

![Gage Dashboard](/client/public/wh2o-next-gage-02.png)

##### Bookmarking a Gage

![Bookmarking a Gage](/client/public/wh2o-next-gage-01.png)

##### Alert Dashboard

![Alert Dashboard](/client/public/wh2o-next-alert-01.png)

##### Adding Immediate Email Notification

![Adding Immediate Email Notification](/client/public/wh2o-next-alert-02.png)

##### Adding Daily Email Notification

![Adding Daily Email Notification](/client/public/wh2o-next-alert-03.png)

##### Mailgun Config

![Mailgun Config](/client/public/wh2o-next-settings-02.png)

##### Twilio Config

![Twilio Config](/client/public/wh2o-next-settings-01.png)

## Note

This app is not intended to be a guidebook. For river beta, see [americanwhitewater.org](https://www.americanwhitewater.org/) or check out their open-source projects, [@AmericanWhitewater](https://github.com/AmericanWhitewater).
