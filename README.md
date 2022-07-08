# wh2o-go

Self-hosted USGS river gage dashboard and custom notifications via Email or SMS built with Go and JavaScript.

![Alert Dashboard](/client/public/wh2o-next-alert-01.png)

## Features

- Daily Reports. Schedule daily emails summarizing your bookmarked gages with [Mailgun](https://www.mailgun.com/).
- Immediate Alerts. Use [Twilio](https://www.twilio.com/docs/sms) to send you an SMS message when your favorite local creek is at prime flow.
- Dashboard. View all your bookmarked gages and their latest readings in one spot.

## Installation

Check for the latest version [here](https://github.com/drewalth/wh2o-next/releases).

### Ubuntu

The dist binary found in Releases was compiled for 32bit Ubuntu on arm7. Specifically a Raspberry Pi 4B.

```sh
$ wget https://github.com/drewalth/wh2o-next/releases/download/v0.1.0/wh2o-next_0.1.0_linux_arm.zip
$ unzip wh2o-next_0.1.0_linux_arm.zip
$ cd wh2o-next_0.1.0_linux_arm/
$ ./wh2o-next
```

### Mac

Open Terminal (cmd+space -> "Terminal").

```sh
$ wget https://github.com/drewalth/wh2o-next/releases/download/v0.1.0/wh2o-next_0.1.0_darwin_amd64.zip
$ unzip wh2o-next_0.1.0_darwin_amd64.zip
$ cd wh2o-next_0.1.0_darwin_amd64/
$ ./wh2o-next
```

## Notification Clients

- [Mailgun Account (Optional - Free)](https://www.mailgun.com/).
- [Twilio Account (Optional - Almost Free)](https://www.twilio.com/docs/sms).

You do not _need_ either a Mailgun or a Twilio account to use the app. You can still view aggregate gage readings from your bookmarked gages without going through the hassle of creating new accounts.

Similarly, if you'd like to use a different email or SMS sdk, just swap out the Mailgun and Twilio usages.

## Development

### System Requirements

- [Golang](https://go.dev/)
- [Nodejs](https://nodejs.org/en/)
- [Docker (Optional)](https://www.docker.com/). For cross-platform compilation with [goreleaser-cross](https://github.com/goreleaser/goreleaser-cross).
- [Semantic Version Util (Optional)](https://github.com/caarlos0/svu). For generating version/release tags.

### Getting Started

1. `git clone https://github.com/drewalth/wh2o-next.git`
2. `cd wh2o-next/`
3. Make scripts executable.

```sh
$ chmod +x ./script/bootstrap.sh
$ chmod +x ./script/dev-server.sh
$ chmod +x ./script/dev-client.sh
```

4. Install dependencies then build server and frontend.

```sh
$ ./script/bootstrap.sh
```

5. Start the Gin server in one tab

```sh
$ ./script/dev-server.sh
```

6. Start create-react-app in another tab

```sh
$ ./script/dev-client.sh
```

## Backup Data

If you'd like to backup data to Dropbox or something else, change the file path for the sqlite database in [`database.go`](/database/database.go).

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

## FAQ

<details>
<summary>
I cannot find the gage I am looking for. How can I add one?
</summary>

If you cannot find a USGS gage in the set, you can manually insert the gage's site number in the input when adding a bookmark. Alternatively, you can add the gage to the source JSON file. See all [gage sources](/lib/sources).

![USGS Page](/client/public/wh2o-next-gage-site-01.png)

</details>

## Nextjs

If you'd prefer not to work with Go and just JavaScript/Nodejs, check out the [NextJs Branch](https://github.com/drewalth/wh2o-next/tree/nextjs). Note that this version of the app is no longer being actively worked on.

## To-Do

- [x] embed json assets into dist binary. See [`gages.HandleGetGageSources`](/core/gages/gages.go) and [`lib`](/lib/).
- [x] embed static frontend files into dist binary.
- [ ] setup goreleaser or some other auto semver service

## Note

This app is not intended to be a guidebook. For river beta, see [americanwhitewater.org](https://www.americanwhitewater.org/) or check out their open-source projects, [@AmericanWhitewater](https://github.com/AmericanWhitewater).
