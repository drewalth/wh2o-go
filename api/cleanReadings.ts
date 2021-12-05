import { Reading } from './database/database'
import { DateTime } from 'luxon'
import { GageReading } from '../types'

export const cleanReadings = async () => {
  const readings = await Reading.findAll()

  if (!readings.length) return

  // @ts-ignore
  const formattedReadings: GageReading[] = readings.map((r) => r.dataValues)

  await Promise.all(
    formattedReadings.map(async (reading) => {
      const diff =
        DateTime.fromJSDate(reading.createdAt).diffNow('hours').hours * -1

      if (diff >= 48) {
        await Reading.destroy({
          where: {
            id: reading.id,
          },
        })
      }
    })
  )
}
