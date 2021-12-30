import { ClimbingAreaForecast as ForecastModel } from './database/database';
import { DateTime } from 'luxon';
import { ClimbingAreaForecast } from '../types';

export const cleanForecasts = async () => {
  const forecasts = await ForecastModel.findAll();
  if (!forecasts.length) return;

  const formattedForecasts: ClimbingAreaForecast[] = forecasts.map(
    // @ts-ignore
    (r) => r.dataValues,
  );

  await Promise.all(
    formattedForecasts.map(async (forecast) => {
      const diff =
        DateTime.fromJSDate(forecast.createdAt).diffNow('hours').hours * -1;

      if (diff >= 1) {
        await ForecastModel.destroy({
          where: {
            id: forecast.id,
          },
        });
      }
    }),
  );
};
