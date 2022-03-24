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
- [Mailgun Account (Free)](https://www.mailgun.com/)
- [Twilio Account (Almost Free)](https://www.twilio.com/docs/sms)

- [Node.js](https://nodejs.org/en/) (developer)

## Installation

<details>
<summary>OSX</summary>

1. Install [Docker](https://www.docker.com/products/docker-desktop/).
2. Clone [Repo](https://github.com/drewalth/wh2o-next)
3. From `wh2o-next` folder run:

```bash
docker compose up -d
```

4. Paste the URL below to view app in browser:

```bash
http://localhost:3000
```

</details>

<details>
<summary>PC</summary>

IDK but I think it is similar to OSX...

</details>

<details>
<summary>Ubuntu</summary>

1. Uninstall old versions

```bash
$ sudo apt-get remove docker docker-engine docker.io containerd runc
```

2. Install Docker Engine

```bash
$ sudo apt-get update
$ sudo apt-get install docker-ce docker-ce-cli containerd.io
```

3. Install Docker Compose (maybe install pip)

```bash
$ pip3 install docker-compose
```

4. Run Docker Compose

```bash
$ docker compose up -d
```

Check containers.

```bash
$ docker ps
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
