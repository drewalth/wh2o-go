import { Reading } from './database/database';
import { GageReading } from '../types';

export const storeReadings = async (
  readings: GageReading[],
): Promise<GageReading[]> => {
  return await Reading.bulkCreate(readings).then(async (res) => {
    await Promise.all(
      res.map(async (reading) => {
        // @ts-ignore
        await reading.setGage(reading.getDataValue('gageId'));
      }),
    );

    // @ts-ignore
    return res.map((el) => el.dataValues);
  });
};
