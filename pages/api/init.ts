import { NextApiRequest, NextApiResponse } from 'next';
import { readyToFetch } from '../../api/readyToFetch';
import { loadGages } from '../../api/loadGages';
import { fetchGageReadings } from '../../api/fetchGageReadings';
import { formatGageReadings } from '../../api/formatGageReadings';
import { storeReadings } from '../../api/storeReadings';
import { cleanReadings } from '../../api/cleanReadings';
import { notify } from '../../api/notify';
import { loadClimbingAreas } from '../../api/loadClimbingAreas';
import { fetchForecasts } from '../../api/fetchForecasts';
import { cleanForecasts } from '../../api/cleanForecasts';
import { storeForecasts } from '../../api/storeForecasts';
import cron from 'node-cron';
import { FetchInterval } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  cron.schedule(
    FetchInterval.ONE_MINUTE,
    async () => {
      // @ts-ignore
      if (!global.gageCron) {
        // @ts-ignore
        global.gageCron = true;
      } else {
        console.log('gageCron already running');
        return;
      }

      const ready = await readyToFetch();

      if (ready) {
        const gages = await loadGages();
        const readings = await fetchGageReadings(gages.map((g) => g.siteId));
        const formattedReadings = formatGageReadings(readings, gages);
        await cleanReadings();
        await storeReadings(formattedReadings);
        await notify(formattedReadings);
      } else {
        console.log('not ready');
      }
    },
    {
      recoverMissedExecutions: false,
    },
  );

  cron.schedule(
    FetchInterval.ONE_HOUR,
    async () => {
      // @ts-ignore
      if (!global.climbCron) {
        // @ts-ignore
        global.climbCron = true;
      } else {
        console.log('climbCron already running');
        return;
      }

      const areas = await loadClimbingAreas();
      const forecasts = await fetchForecasts(areas.map((area) => area.areaId));
      await cleanForecasts();
      await storeForecasts(forecasts);
    },
    {
      recoverMissedExecutions: false,
    },
  );

  res.status(200).send('Cron Initialized');
}
