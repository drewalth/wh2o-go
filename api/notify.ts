import { GageReading, Alert } from '../types'
import { Alert as AlertModel } from './database/database'
import { DateTime } from 'luxon'
import { sendEmail } from './sendEmail'
import { sendSMS } from './sendSMS'

const checkLastNotification = (alert: Alert): boolean => {
  const nextSendDiff = Number(
    (DateTime.fromJSDate(alert.nextSend).diffNow('hours').hours * -1).toFixed(2)
  )
  const alertTimeDiff = Number(
    (
      DateTime.fromJSDate(alert.notifyTime).diffNow('minutes').minutes * -1
    ).toFixed(2)
  )

  return (
    nextSendDiff >= 0.0 &&
    nextSendDiff <= 0.04 &&
    alertTimeDiff >= 0 &&
    alertTimeDiff <= 3
  )
}

export const notify = async (readings: GageReading[]) => {
  const alerts: Alert[] = await AlertModel.findAll().then((res) =>
    // @ts-ignore
    res.map((v) => v.dataValues)
  )
  const dailyAlerts = alerts?.filter((alert) => alert.interval === 'daily')

  if (dailyAlerts.length) {
    await Promise.all(
      alerts.map(async (alert) => {
        if (checkLastNotification(alert)) {
          if (alert.channel === 'email') {
            await sendEmail(alert, readings)
          } else {
            await sendSMS(alert, readings)
          }
          await AlertModel.update(
            {
              nextSend: DateTime.now().plus({ hours: 24 }).toJSDate(),
            },
            {
              where: { id: alert.id },
            }
          )
        }
      })
    )
  }

  // if (alerts.length !== 0) {
  //     alerts.forEach(alert => {
  //         const filteredReadings = readings.filter(reading => reading.gageId === alert.gageId && reading.metric === alert.metric)
  //
  //         filteredReadings.forEach(reading => {
  //             if (alert.criteria === 'below' && reading.value < alert.value) {
  //                 console.debug('notify below')
  //             }
  //
  //             if (alert.criteria === 'between' && !!alert.minimum && !!alert.maximum && reading.value > alert.minimum && reading.value < alert.maximum) {
  //                 console.debug('notify between')
  //             }
  //
  //             if (alert.criteria === 'above' && reading.value > alert.value) {
  //                 console.debug('notify above')
  //             }
  //
  //         })
  //     })
  // }
}
