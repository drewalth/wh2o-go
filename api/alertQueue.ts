import { Queue, QueueScheduler, Worker } from 'bullmq';
import { Alert, AlertInterval, Queues } from '../types';
import { REDIS_HOST, REDIS_PORT } from '../lib';
import { logger } from './logger';
import { Alert as AlertModel } from './database/database';
import Sequelize from 'sequelize';
import { DateTime } from 'luxon';
import moment from 'moment';
import { loadUserConfig } from './loadUserConfig';
import { loadGages } from './loadGages';
import { addEmailJob } from './emailQueue';

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

/**
 * Required for repeatable jobs to work.
 * @see https://docs.bullmq.io/guide/jobs/repeatable
 */
const alertQueueScheduler = new QueueScheduler(Queues.ALERT, { connection });

export const alertQueue = new Queue(Queues.ALERT, {
  connection,
});

alertQueue.on('connection', async () => {
  await alertQueue.obliterate().then(() => {
    logger.log('Alert Queue Jobs Obliterated');
  });
});

const isPendingNotification = (
  notification: Alert,
  timezone: string,
): boolean => {
  const { notifyTime } = notification;
  const format = 'HH:mm';

  const now = DateTime.fromISO(DateTime.now().toString(), {
    zone: timezone,
  }).toLocaleString(DateTime.TIME_24_SIMPLE);

  const alertTime = DateTime.fromISO(
    moment(moment(notifyTime).format(format), format).toISOString(),
  );

  const formattedNotifyTime =
    alertTime.hour +
    ':' +
    (alertTime.minute === 0
      ? alertTime.minute.toString() + '0'
      : alertTime.minute);

  const checkNotificationWindow = () => {
    // check if we're in the same hour
    if (now.substring(0, 2) === formattedNotifyTime.substring(0, 2)) {
      const nowMinutes = parseInt(now.substring(3, 5), 10);
      const alertMinutes = parseInt(formattedNotifyTime.substring(3, 5), 10);
      const alertWindow = alertMinutes + 4; // add 4 min padding...

      return nowMinutes >= alertMinutes && nowMinutes <= alertWindow;
    }
    return false;
  };

  return now === formattedNotifyTime || checkNotificationWindow();
};

const handleDailyNotificationJob = async () => {
  const { timezone } = await loadUserConfig();

  const dailyAlerts = await AlertModel.findAll({
    where: {
      // @ts-ignore
      lastSent: {
        [Sequelize.Op.or]: {
          [Sequelize.Op.eq]: null,
          [Sequelize.Op.lte]: DateTime.now()
            .minus({
              hours: 24,
            })
            .toJSDate(),
        },
      },
    },
  });

  // this could/should be done with sql query
  const filteredAlerts = dailyAlerts
    .map((v) => {
      // @ts-ignore
      return v.dataValues as Alert;
    })
    .filter((a) => a.interval === AlertInterval.DAILY);

  if (filteredAlerts.length > 0) {
    await Promise.all(
      filteredAlerts.map(async (alert) => {
        if (isPendingNotification(alert, timezone)) {
          const gages = await loadGages();
          await addEmailJob(alert, gages, 'dailyNotify');
          await AlertModel.update(
            {
              lastSent: new Date(),
            },
            {
              where: {
                id: alert.id,
              },
            },
          );
        }
      }),
    );
  }
};

const alertWorker = new Worker(
  Queues.ALERT,
  async (job: { data: any; name: string }) => {
    if (job.name === 'dailyReport') {
      await handleDailyNotificationJob();
    }
  },
  {
    connection,
  },
);

alertWorker.on('failed', (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});
