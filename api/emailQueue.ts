import { Queue, Worker } from 'bullmq';
import { Alert, EmailQueueJobData, Gage, Queues } from '../types';
import { REDIS_HOST, REDIS_PORT } from '../lib';
import { logger } from './logger';
import { sendEmail } from './sendEmail';

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

export const emailQueue = new Queue(Queues.EMAIL, {
  connection,
});

emailQueue.on('connection', async () => {
  await emailQueue.obliterate().then(() => {
    logger.log('Email Queue Jobs Obliterated.');
  });
});

export const addEmailJob = (
  alert: Alert,
  gages: Gage | Gage[],
  name: 'gageNotify' | 'dailyNotify',
) =>
  emailQueue.add(name, {
    gages,
    alert,
  });

const emailWorker = new Worker(
  Queues.EMAIL,
  async (job: EmailQueueJobData) => {
    const { gages, alert } = job.data;
    await sendEmail(alert, gages);
  },
  {
    connection,
  },
);

emailWorker.on('failed', (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});
