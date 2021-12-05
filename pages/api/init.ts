import { NextApiRequest, NextApiResponse } from 'next'
import { fetchInterval } from '../../lib'
import { readyToFetch } from '../../api/readyToFetch'
import { loadGages } from '../../api/loadGages'
import { fetchGageReadings } from '../../api/fetchGageReadings'
import { formatGageReadings } from '../../api/formatGageReadings'
import { storeReadings } from '../../api/storeReadings'
import { cleanReadings } from '../../api/cleanReadings'
import { notify } from '../../api/notify'
import { loadClimbingAreas } from '../../api/loadClimbingAreas'
import { fetchForecasts } from '../../api/fetchForecasts'
import { cleanForecasts } from '../../api/cleanForecasts'
import { storeForecasts } from '../../api/storeForecasts'
const cron = require('node-cron')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>
) {
  console.log('initialize')

  cron.schedule(
    `*/1 * * * *`,
    async () => {
      console.log(`running a task every ${fetchInterval} minute(s)`)

      const ready = await readyToFetch()

      if (ready) {
        const gages = await loadGages()
        const readings = await fetchGageReadings(gages.map((g) => g.siteId))
        const formattedReadings = formatGageReadings(readings, gages)
        await cleanReadings()
        await storeReadings(formattedReadings)
        await notify(formattedReadings)
      }
    },
    {
      recoverMissedExecutions: false,
    }
  )

  // change this to one hour when going to prod

  cron.schedule(
    `*/1 * * * *`,
    async () => {
      const areas = await loadClimbingAreas()
      const forecasts = await fetchForecasts(areas.map((area) => area.areaId))
      await cleanForecasts()
      await storeForecasts(forecasts)
    },
    {
      recoverMissedExecutions: false,
    }
  )

  res.status(200).send('Cron Initialized')
}
