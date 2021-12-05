import { NextApiRequest, NextApiResponse } from 'next'
import { fetchInterval } from '../../lib'
import { readyToFetch } from '../../api/readyToFetch'
import { loadGages } from '../../api/loadGages'
import { fetchGageReadings } from '../../api/fetchGageReadings'
import { formatGageReadings } from '../../api/formatGageReadings'
import { storeReadings } from '../../api/storeReadings'
import { cleanReadings } from '../../api/cleanReadings'
import { notify } from '../../api/notify'
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

  res.status(200).send('Cron Initialized')
}
