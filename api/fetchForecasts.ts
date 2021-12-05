export const fetchForecasts = async (
  areaIds: number[]
): Promise<
  {
    areaId: number
    value: string
  }[]
> => {
  const val = require('./mockClimbingAreaForecast.json')
  return [{ areaId: areaIds[0], value: JSON.stringify(val) }]
}
