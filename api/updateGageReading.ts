import { Gage, GageReading } from '../types';
import { Gage as GageModel } from './database/database';

/**
 * Update the "reading" field on Gage Model
 *
 * @param readings
 * @param gages
 */
export const updateGageReading = async (
  readings: GageReading[],
  gages: Gage[],
) => {
  const idSet = new Set(readings.map((r) => r.siteId));
  const siteIds: string[] = [...idSet];

  await Promise.all(
    siteIds.map(async (siteId) => {
      const gage = gages.find((g) => g.siteId === siteId);
      if (!gage) return;
      const reading = readings.find(
        (r) => r.siteId === siteId && r.metric === gage.metric,
      );
      if (!reading) return;

      await GageModel.update(
        {
          reading: reading.value,

          lastFetch: new Date(),
        },
        {
          where: { id: gage.id },
        },
      );
    }),
  ).catch((e) => {
    console.error(e);
  });
};
