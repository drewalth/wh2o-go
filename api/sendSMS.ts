import { sms } from './smsClient'
import { GageReading, Alert } from '../types'
import { PHONE_NUMBER, FROM_PHONE_NUMBER } from '../lib'

const getSMSBody = (readings: GageReading[]) => {
  let body = ''

  readings.forEach((reading) => {
    body += `\n${reading.gageName} ${reading.value} ${reading.metric}\n---`
  })
  return body
}

export const sendSMS = async (alert: Alert, readings: GageReading[]) => {
  try {
    await sms.messages.create({
      body: getSMSBody(readings),
      to: PHONE_NUMBER,
      from: FROM_PHONE_NUMBER,
    })
  } catch (e) {
    console.log(e)
  }
}
