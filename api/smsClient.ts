import twilio from 'twilio';
import { loadUserConfig } from './loadUserConfig';

export const smsClient = async () => {
  const { twilioAccountSID, twilioAuthToken } = await loadUserConfig();

  if (!twilioAccountSID || !twilioAuthToken) {
    throw new Error('Invalid Twilio Info');
  }

  return twilio(twilioAccountSID, twilioAuthToken, {
    lazyLoading: true,
  });
};
