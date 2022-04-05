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

- [Mailgun Account (Optional - Free)](https://www.mailgun.com/)
- [Twilio Account (Optional - Almost Free)](https://www.twilio.com/docs/sms)

You do not _need_ either a Mailgun or a Twilio account to use the app. You can still view aggregate gage readings from your bookmarked gages without going through the hassle of creating new accounts. Similarly, if you'd like to use a different email or SMS client, just swap out the Mailgun and Twilio usages + config with your preferred library.

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

## Note

This app is not intended to be a guidebook. For river beta, see [americanwhitewater.org](https://www.americanwhitewater.org/) or check out their open-source projects, [@AmericanWhitewater](https://github.com/AmericanWhitewater).
