import { Queue, Worker } from 'bullmq';
import { Queues, SMSQueueJobData } from '../types';
import { REDIS_HOST, REDIS_PORT } from '../lib';
import { logger } from './logger';
import { sendSMS } from './sendSMS';

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

export const smsQueue = new Queue(Queues.SMS, {
  connection,
});

smsQueue.on('connection', async () => {
  await smsQueue.obliterate().then(() => {
    logger.log('SMS Queue Jobs Obliterated.');
  });
});

export const addSMSJob = ({ data: { gage, alert } }: SMSQueueJobData) =>
  smsQueue.add('immediateSMS', {
    gage,
    alert,
  });

const smsWorker = new Worker(
  Queues.SMS,
  async (job: SMSQueueJobData) => {
    const { gage, alert } = job.data;
    await sendSMS(alert, gage);
  },
  {
    connection,
  },
);

smsWorker.on('failed', (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});
