import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from '../lib/environment'

export const sms = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
})
