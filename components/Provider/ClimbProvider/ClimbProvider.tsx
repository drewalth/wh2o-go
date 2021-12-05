import { ReactNode, useEffect, useState } from 'react'
import { ClimbContext } from './ClimbContext'
import {
  ClimbingArea,
  ClimbingAreaForecast,
  ClimbingAreaForecastValue,
} from '../../../types'
import { getClimbingArea, getClimbingAreaForecasts } from '../../../controllers'

type ClimbProviderProps = {
  children: ReactNode
}

export const ClimbProvider = ({ children }: ClimbProviderProps) => {
  const [areas, setAreas] = useState<ClimbingArea[]>([])
  const [forecasts, setForecasts] = useState<ClimbingAreaForecast[]>([])

  const loadAreas = async () => {
    try {
      const areas = await getClimbingArea()
      setAreas(areas)
    } catch (e) {
      console.log(e)
    }
  }

  const loadForecasts = async () => {
    try {
      const forecasts = await getClimbingAreaForecasts()

      const val = forecasts.map((v) => ({
        ...v,
        // @ts-ignore
        value: JSON.parse(v.value),
      }))

      setForecasts(val)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadAreas()
      await loadForecasts()
    })()
  }, [])

  return (
    <ClimbContext.Provider
      value={{
        areas,
        forecasts,
        loadAreas,
      }}
    >
      {children}
    </ClimbContext.Provider>
  )
}
