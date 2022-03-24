import FormData from 'form-data';
import Mailgun from 'mailgun.js';
const mailgun = new Mailgun(FormData);

export const emailClient = (key: string) =>
  mailgun.client({
    username: 'foo',
    key,
  });
