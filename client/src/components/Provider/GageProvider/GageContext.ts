import { createContext, useContext } from 'react'
import { Country, Gage, GageEntry } from '../../../types'

type GageContextData = {
  gages: Gage[]
  gageSources: GageEntry[]
  loadGageSources: (country: Country, state: string) => Promise<void>
  loadGages: () => Promise<void>
}

export const GageContext = createContext({} as GageContextData)

export const useGagesContext = (): GageContextData => useContext(GageContext)
