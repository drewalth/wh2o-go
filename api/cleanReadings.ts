import { Reading } from './database/database';
import { DateTime } from 'luxon';
import { GageReading } from '../types';
import Sequelize from 'sequelize';

/**
 * delete old readings to help keep db size down
 */
export const cleanReadings = async (): Promise<void> => {
  const age = 4; // in hours
  const readings = await Reading.findAll({
    where: {
      // @ts-ignore
      createdAt: {
        [Sequelize.Op.lte]: DateTime.now()
          .minus({
            hours: age,
          })
          .toJSDate(),
      },
    },
  });

  if (!readings.length) {
    console.log('No readings to clean');
    return;
  }

  // @ts-ignore
  const formattedReadings: GageReading[] = readings.map((r) => r.dataValues);

  await Promise.all(
    formattedReadings.map(async (reading) => {
      await Reading.destroy({
        where: {
          id: reading.id,
        },
      });
    }),
  );
};
