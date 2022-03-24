import { Queue, Worker, QueueScheduler } from 'bullmq';
import { GageQueueJobData, Queues } from '../types';
import { REDIS_HOST, REDIS_PORT } from '../lib';
import { loadGages } from './loadGages';
import { fetchGageReadings } from './fetchGageReadings';
import { formatGageReadings } from './formatGageReadings';
import { notify } from './notify';
import { logger } from './logger';
import { updateGageReading } from './updateGageReading';
import { cleanReadings } from './cleanReadings';
import { storeReadings } from './storeReadings';
import { DateTime } from 'luxon';
import { socketRef } from '../pages/api/socket';

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

/**
 * Required for repeatable jobs to work.
 * @see https://docs.bullmq.io/guide/jobs/repeatable
 */
const gageQueueScheduler = new QueueScheduler(Queues.GAGE, { connection });

export const gageQueue = new Queue(Queues.GAGE, {
  connection,
});

gageQueue.on('connection', async () => {
  await gageQueue.obliterate().then(() => {
    logger.log('Gage Queue Jobs Obliterated.');
  });
});

const worker = new Worker(
  Queues.GAGE,
  async (job: GageQueueJobData) => {
    if (job.data.ready) {
      try {
        logger.log(
          `${DateTime.now().toFormat('hh:mm a')} :: Fetching Readings...`,
        );
        const gages = await loadGages();
        const readings = await fetchGageReadings(gages.map((g) => g.siteId));
        const formattedReadings = formatGageReadings(readings, gages);
        await cleanReadings();
        const storedReadings = await storeReadings(formattedReadings);
        await updateGageReading(storedReadings, gages);
        await notify(formattedReadings, gages);
        if (socketRef) {
          socketRef.emit('gagesUpdated');
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
  {
    connection,
  },
);

worker.on('failed', (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});
