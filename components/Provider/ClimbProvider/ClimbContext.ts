import { ClimbingArea, ClimbingAreaForecast } from '../../../types'
import { createContext, useContext } from 'react'

export type ClimbContextData = {
  areas: ClimbingArea[]
  forecasts: ClimbingAreaForecast[]
  loadAreas: () => Promise<void>
}

export const ClimbContext = createContext({} as ClimbContextData)

export const useClimbContext = () => useContext(ClimbContext)
