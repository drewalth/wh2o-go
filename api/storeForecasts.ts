import { ClimbingAreaForecast } from './database/database'

export const storeForecasts = async (
  forecasts: { areaId: number; value: string }[]
) => {
  return await ClimbingAreaForecast.bulkCreate(forecasts)
}
