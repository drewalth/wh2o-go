import { Gage, USGSFetchSchedule } from './database/database';
import { DateTime } from 'luxon';
import { fetchInterval } from '../lib';
import { logger } from './logger';

export const readyToFetch = async (): Promise<boolean> => {
  // first check if any gages have been added
  const gages = await Gage.findAll();
  if (!gages.length) {
    logger.log('no gages...');
    return false;
  }

  const nextFetch = await USGSFetchSchedule.findOne({
    where: { id: 1 },
  }).then((res) => res?.getDataValue('nextFetch'));

  // check if first time fetch
  if (!nextFetch) {
    await USGSFetchSchedule.create({
      nextFetch: DateTime.now().plus({ minutes: fetchInterval }),
    });
    logger.log('First fetch...');
    return true;
  } else {
    const formattedNextFetch = DateTime.fromJSDate(nextFetch);
    const diff = formattedNextFetch.diffNow('minutes').minutes * -1;
    const ready = diff >= fetchInterval;

    console.log('ready: ', ready);

    if (ready) {
      await USGSFetchSchedule.update(
        {
          nextFetch: DateTime.now().plus({ minutes: fetchInterval }),
        },
        {
          where: { id: 1 },
        },
      );

      return true;
    } else {
      return false;
    }
  }
};
