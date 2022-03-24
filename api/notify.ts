import { Alert, AlertChannel, Gage, GageReading } from '../types';
import { Alert as AlertModel } from './database/database';
import { DateTime } from 'luxon';
import { addEmailJob } from './emailQueue';
import { addSMSJob } from './smsQueue';

const checkLastSent = (alert: Alert) => {
  if (!alert.lastSent) return true;

  const diff = DateTime.fromJSDate(alert.lastSent).diffNow('hours').hours * -1;
  return diff >= 6;
};

const updateAlert = async (alert: Alert) => {
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
};

export const notify = async (
  readings: GageReading[],
  gages: Gage[],
): Promise<void> => {
  // more performant to use promise all
  gages.forEach((gage) => {
    if (gage.alerts && gage.alerts.length > 0) {
      gage.alerts.forEach((alert) => {
        const relevantReading = readings.find(
          (r) => r.gageId === alert.gageId && r.metric === alert.metric,
        );

        if (!relevantReading) {
          console.log('No relevant reading');
          return;
        }

        const meetsCriteria =
          (alert.criteria === 'below' && relevantReading.value < alert.value) ||
          (alert.criteria === 'between' &&
            !!alert.minimum &&
            !!alert.maximum &&
            relevantReading.value > alert.minimum &&
            relevantReading.value < alert.maximum) ||
          (alert.criteria === 'above' && relevantReading.value > alert.value);

        if (meetsCriteria && checkLastSent(alert)) {
          if (alert.channel === AlertChannel.EMAIL) {
            addEmailJob(alert, gage, 'gageNotify');
          }
          if (alert.channel === AlertChannel.SMS) {
            addSMSJob({
              data: {
                gage,
                alert,
              },
            });
          }

          updateAlert(alert);
        }
      });
    }
  });
};
