<div style=" display: flex; align-items: center">

<span style="border: 2px solid #fff;max-width: 25%;">

![Adding Daily Email Notification](/public/logo.svg)

</span>

# wh2o-next

</div>

With `wh2o-next` you can subscribe to USGS river gages via
the [Official REST API](https://waterservices.usgs.gov/rest/IV-Service.html), view aggregate gage reading data in the
browser and create custom notifications--daily emails summarizing all your bookmarked gages or immediate SMS alerts when
a gage reading value meets your criteria.

![Alert Dashboard](/public/wh2o-next-alert-01.png)

<details>
<summary>Note</summary>

- If you're running this app on a machine in your home network (like a Raspberry Pi in the living room), you will most
  likely need to setup port forwarding on your home router to access the app off of your home wifi network.
- If developing, please be mindful of USGS resources/usage limits. The current fetch interval is set to retreive gage
  data every five minutes. This meets their requirements, but consider increasing time between HTTP requests to 15min.
- All of the data you enter into the app is stored locally on your machine and not shared with anyone.

</details>

## Requirements

- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/en/)
- [Mailgun Account (Free)](https://www.mailgun.com/)
- [Twilio Account (Almost Free)](https://www.twilio.com/docs/sms)

## Installation

[comment]: <> (<details>)

[comment]: <> (<summary>OSX</summary>)

[comment]: <> (1. Install [Docker]&#40;https://www.docker.com/products/docker-desktop/&#41;.)

[comment]: <> (2. Clone [Repo]&#40;https://github.com/drewalth/wh2o-next&#41;)

[comment]: <> (3. From `wh2o-next` folder run:)

[comment]: <> (```bash)

[comment]: <> (docker compose up -d)

[comment]: <> (```)

[comment]: <> (4. Paste the URL below to view app in browser:)

[comment]: <> (```bash)

[comment]: <> (http://localhost:3000)

[comment]: <> (```)

[comment]: <> (</details>)

[comment]: <> (<details>)

[comment]: <> (<summary>PC</summary>)

[comment]: <> (IDK but I think it is similar to OSX...)

[comment]: <> (</details>)

<details>
<summary>Ubuntu</summary>

1. `ssh` onto your machine
2. Uninstall old Docker versions

```bash
$ sudo apt-get remove docker docker-engine docker.io containerd runc
```

3. Install Docker Engine

```bash
$ sudo apt-get update
$ sudo apt-get install docker-ce docker-ce-cli containerd.io
```

4. Install Docker Compose (maybe install pip)

```bash
$ pip3 install docker-compose
```

5. Install Nodejs

```bash
$ curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
$ sudo apt install nodejs
```

6. Install Git + Clone App

```bash
$ sudo apt install git-all
$ git clone https://github.com/drewalth/wh2o-next.git
$ cd wh2o-next/
```

7. Run Docker Compose

```bash
$ docker compose up -d
```

8. Build + Start App

```bash
$ npm ci
$ npm run build
$ npm ci --production
$ npm start
```

For more detail see official [docs](https://docs.docker.com/engine/install/ubuntu/).

</details>

## Development

```bash
$ docker compose up -d
$ npm ci
$ npm run dev
```

## Production

```bash
$ docker compose up -d
$ npm ci
$ npm run build
$ npm ci --production
$ npm start
```

## Configuration

<details>
<summary>Email</summary>

#### 1. Setup Mailgun

Sign up for a [Mailgun](https://www.mailgun.com/) account (~26min)

#### 2. Change Timezone

First change the timezone in the Settings UI. Timezone is required for accurate notification delivery. I ran into some
issues setting DateTime/Timezone when running the app on an EC2 instance. I'm sure there is a simple solution out
there...

</details>

<details>
<summary>SMS</summary>

Follow the following steps / docs to get setup for SMS (text message) notifications.

Just a heads up, setting up Twilio is kind of envolved and a little expensive. No problem if you do not want to use SMS.
You can leave the settings for SMS empty just know that if you try to add an SMS notification it will error.

#### 1. Setup Twilio

Sign up for a [Twilio](https://www.twilio.com/docs/sms) account (~30min)

Copy and securely save:

```bash

```

</details>

## Screenshots

##### Gage Dashboard

![Gage Dashboard](/public/wh2o-next-gage-02.png)

##### Bookmarking a Gage

![Bookmarking a Gage](/public/wh2o-next-gage-01.png)

##### Alert Dashboard

![Alert Dashboard](/public/wh2o-next-alert-01.png)

##### Adding Immediate Email Notification

![Adding Immediate Email Notification](/public/wh2o-next-alert-02.png)

##### Adding Daily Email Notification

![Adding Daily Email Notification](/public/wh2o-next-alert-03.png)

##### Mailgun Config

![Mailgun Config](/public/wh2o-next-settings-02.png)

##### Twilio Config

![Twilio Config](/public/wh2o-next-settings-01.png)

## FAQ

- Missing a gage? If you don't see a gage yoou want bookmark in the preloaded list, copy the site ID from the USGS river
  page and paste it in the gage input. Or, open a PR and add it to the [`allGages`](/lib/allGages.ts) file.
- Want to use different Email or SMS provider? Swap out Nodejs SDKs in the [`smsClient`](/api/smsClient.ts)
  and [`sendEmail`](/api/sendEmail.ts) files.

## ToDo

- [ ] Consolidate DateTime libraries. Moment or Luxon.
- [ ] Fix typings and remove `@ts-ignore`s

#### Considerations

- Using the Nextjs API pages this way isn't that sweet. With Redis in the stack too, it would be cleaner to just create
  a separate server and serve static files for the frontend.
- Historical data and Graphs. Would be cool to change the [`cleanReadings`](/api/cleanReadings.ts) threshold, line 10,
  and render data in chart.

```bash
|- server
|- client (React app compiled n served by nginx)
|- nginx
|- redis
|- sqlite (or whatever)
```
