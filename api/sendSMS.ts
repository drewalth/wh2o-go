import { smsClient } from './smsClient';
import { Alert, Gage } from '../types';
import { loadUserConfig } from './loadUserConfig';

const getSMSBody = (gage: Gage) => {
  let body = '';

  // readings.forEach((reading) => {
  //   body += `\n${reading.gageName} ${reading.value} ${reading.metric}\n---`;
  // });

  body += `
  ${gage.name}
  ${gage.reading}
  ${gage.metric}
  ${gage.updatedAt}
  `;

  return body;
};

export const sendSMS = async (alert: Alert, gage: Gage) => {
  if (!gage) {
    throw new Error('No GAGE Yo!');
  }

  try {
    const { twilioSMSTelephoneNumberTo, twilioSMSTelephoneNumberFrom } =
      await loadUserConfig();

    if (!twilioSMSTelephoneNumberFrom || !twilioSMSTelephoneNumberTo) {
      throw new Error('Need telephone numbers');
    }

    const sms = await smsClient();
    await sms.messages.create({
      body: getSMSBody(gage),
      to: twilioSMSTelephoneNumberTo,
      from: twilioSMSTelephoneNumberFrom,
    });
  } catch (e) {
    console.log(e);
  }
};
