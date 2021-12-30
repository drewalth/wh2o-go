import axios from 'axios';

export const fetchForecasts = async (
  areaIds: number[],
): Promise<
  {
    areaId: number;
    value: string;
  }[]
> => {
  // const val = require('./mockClimbingAreaForecast.json')

  return await Promise.all(
    areaIds.map(async (areaId) => {
      const val = await axios.get(
        `https://api.climbingweather.com/area/${areaId}/forecast`,
      );

      return {
        areaId,
        value: JSON.stringify(val),
      };
    }),
  ).then((result) => result);
};
