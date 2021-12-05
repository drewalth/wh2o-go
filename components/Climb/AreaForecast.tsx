import { ClimbingAreaForecast } from '../../types'

type AreaForecastProps = {
  forecast?: ClimbingAreaForecast
}
export const AreaForecast = ({ forecast }: AreaForecastProps) => {
  if (!forecast) return <></>

  return <div>{JSON.stringify(forecast)}</div>
}
