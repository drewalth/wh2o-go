import FormData from 'form-data'
import Mailgun from 'mailgun.js'
const mailgun = new Mailgun(FormData)
import { MAILGUN_API_KEY } from './index'

export const emailClient = mailgun.client({
  username: 'foo',
  key: MAILGUN_API_KEY || 'key',
})
