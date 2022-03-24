import { NextApiRequest, NextApiResponse } from 'next';
import { FetchInterval } from '../../types';
import { gageQueue } from '../../api/gageQueue';
import { alertQueue } from '../../api/alertQueue';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const existingGageJobs = await gageQueue.getRepeatableJobs();
  const existingAlertJobs = await alertQueue.getRepeatableJobs();

  if (existingGageJobs.length === 0) {
    await gageQueue.add(
      'fetchReadings',
      { ready: true },
      {
        repeat: {
          cron: FetchInterval.FIVE_MINUTES,
        },
        jobId: 'fetchId',
      },
    );
  }

  if (existingAlertJobs.length === 0) {
    await alertQueue.add(
      'dailyReport',
      { ready: true },
      {
        repeat: {
          cron: FetchInterval.FIVE_MINUTES,
        },
        jobId: 'dailyReportId',
      },
    );
  }

  res.status(200).send('Jobs initialized');
}
