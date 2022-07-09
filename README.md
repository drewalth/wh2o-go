<div style="text-align: center;">

![logo](https://wh2o-assets-static.s3.us-west-1.amazonaws.com/wh2o-logo.png)

## wh2o-go

</div>

Self-hosted dashboard and custom notifications via Email and SMS for rivers in the United States, Canada, New Zealand
and Chile.

## Features

- Daily Reports. Schedule daily emails summarizing your bookmarked gages sent with [Mailgun](https://www.mailgun.com/).
- Immediate Alerts. Use the [Twilio](https://www.twilio.com/docs/sms) SDK to send an SMS when your favorite local creek
  is at prime flow.
- Dashboard. View all your bookmarked gages and their latest readings in one spot.

## Data Sources

River data for gages in the United States come from the United States Geological
Survey's [REST API](http://waterservices.usgs.gov) and are fetched every 15 minutes.

Readings for Canadian gages come from hourly reports published by the [Canadian Government](https://weather.gc.ca/). The
reports are distributed as CSVs downloaded, then parsed for the dashboard.

Readings from New Zealand and Chile are fetched every hour using web scrapers.

## Getting Started

The easiest way to run the app is to clone or download this repository then build it locally on your machine.

This requires:

- [Golang](https://go.dev/)
- [Nodejs](https://nodejs.org/en/)
- [Git](https://git-scm.com/) (if you want to clone the repo)

Once you have a copy of the repository on your machine, open Terminal (or Command Prompt on Windows) and navigate to
the `wh2o-go` directory. Next make the included build script executable then run it. This will compile the React app (
client), the Go server (API) and output a single executable binary in `wh2o-go/bin/main`. (Definitely one of my favorite
features of Go! Fullstack app in a single binary?! 😎)

```shell
chmod +x ./_script/build.sh
./_script/build.sh
```

Next to send yourself Email and SMS, create accounts with [Mailgun Account](https://www.mailgun.com/)
and [Twilio Account](https://www.twilio.com/docs/sms).

> You do not _need_ either a Mailgun or a Twilio account to use the app. You can still view aggregate gage readings from
> your bookmarked gages without going through the hassle of creating new accounts.

Once your accounts are set up, open the app in your web browser by entering `http://localhost:3000` in the URL bar.
Navigate to the Settings tab and input your Mailgun and Twilio credentials.

Now you're ready to start bookmarking gages and creating alerts!

## Contributing

If you would like to contribute to this project, please feel free to create a new branch and open a Pull Request!

### Development

From the `wh2o-go` directory, navigate to the `client/` and start the React app:

```shell
cd client/
npm start
```

The Webpack dev server will open your browser automatically at `http://localhost:8080`.

In a new Terminal tab and from the `wh2o-go` directory, start the Go server:

```shell
go run main.go
```

If you are making changes to and of the [gage source JSON files](/gage/sources), please note that you will have to
restart the Go server to see the changes reflected. This is because they are embedded in the binary.

## Screenshots

##### Alert Dashboard

![Alert Dashboard](/client/public/wh2o-next-alert-01.png)

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

If you cannot find a USGS gage in the set, you can manually insert the gage's site number in the input when adding a
bookmark. Alternatively, you can add the gage to the source JSON file. See all [gage sources](/lib/sources).

![USGS Page](/client/public/wh2o-next-gage-site-01.png)

</details>

## Nextjs

If you'd prefer not to work with Go and just JavaScript/Nodejs, check out
the [NextJs Branch](https://github.com/drewalth/wh2o-next/tree/nextjs). Note that this version of the app is no longer
being actively worked on.

## Related Projects

This app is not intended to be a guidebook. For river beta in British Columbia,
checkout [bcwhitewater.org](https://www.bcwhitewater.org/).

If you're looking for a native mobile app, I highly
recommend [RiverApp](https://apps.apple.com/us/app/riverapp-river-levels/id667012473). They have a HUGE dataset and
active community of paddlers around the world. 

For river beta in the United States,
see [americanwhitewater.org](https://www.americanwhitewater.org/) or check out their open-source
projects, [@AmericanWhitewater](https://github.com/AmericanWhitewater).

