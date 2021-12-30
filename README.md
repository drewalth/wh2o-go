# wh2o-next

Another application in the [wh2o](https://wh2o.us/) series built using [Next.js](https://nextjs.org/) that gives river enthusiasts a way to check USGS Gage levels and create either email or SMS alerts based on provided criteria.

In addition to river flow levels, I've added Climbing Area weather too to turn this into a one-stop-shop for the data needed to plan the day's activities.

I hope to add Snow Forecasts and Avalanche Danger reports in the future.

## System Requirements

- [node.js](https://nodejs.org/en/)

## Setup

- Clone or download the app
- In the terminal, navigate to project directory:

```bash
cd wh2o-next
```

- Install project dependencies:

```bash
npm install
```

- If you want to get an email or SMS notification, see "Creating an Alert" below.
- Build the app:

```bash
npm run build
```

- Start it up:

```bash
npm start
```

## Adding a Gage

Once the app has started, click the "Add Gage" button to the right of the screen. Next, select which state, then start typing the gage name, and the options will appear.

##### Don't See Your Gage?

- If you know the gage USGS site ID, you can enter that in the input field, and you will still get gage readings. It may look funny at first (bug), but once readings are fetched from USGS, the gage name will be updated in the UI.
- If you have a GitHub account, you can create a new branch, and add the gage name, and site ID to [allGages.ts](./lib/allGages.ts)

## Creating an Alert

Before you can create an alert, you need to decide how you want to be notified. If you want to receive email alerts, sign up for a free account with [Mailgun](https://www.mailgun.com/). If you want to receive SMS alerts, sign up for a free account with [Twilio](https://www.twilio.com/).

Once you created you account(s), open copy the `.env.example` file:

```bash
cp .env.example .env
```

Open the newly created `.env` file and paste in your Mailgun and/or Twilio API tokens/pertinent data:

```bash
# mailgun key + domain
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
# the email address you want to send reports to
EMAIL_ADDRESS=

# twilio stuff
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
FROM_PHONE_NUMBER=
# the number you want to send texts to
PHONE_NUMBER=
```

Once you've got your tokens and numbers added, rebuild and start the app:

```bash
npm run build && npm run start
```

You must first add a gage to your gages list before creating an alert.

Add a gage, then click the Alert submenu item.

Click "Create Alert" then choose your options.

## Where to Run

Okay, all that is great, right? But where should this app live?

Personally, I run this on a Raspberry Pi in my living room but there are tons of options:

- Heroku
- AWS
- Google Cloud
- Your work computer
- Your PC from 2009

## Considerations

This app is FAR from perfect and has some unfortunate design flaws that will eventually (hopefully) be addressed:

- Fetching gage readings should be a queued Redis job, not a cron job dependant on global variable checks and a call to an "init" function...
- amongst others...

I'd like to make this as non-developer-friendly as possible, and so far it is pretty involved. There are a few easy steps to take to help make that possible:

1. Make a UI for adding `.env` variables on a "settings" page. i.e. Mailgun + Twilio tokens.
2. Dockerizing the app. So the only required steps would be installing Docker and running `docker compose up -d` or whatever.

If you're interested in making this better, please feel free to open a PR!

## Copyright Notice

Check the license, but please don't use the logo for anything else...
