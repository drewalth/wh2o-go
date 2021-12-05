import { createContext, useState, useContext, useEffect } from 'react'
import { Gage, GageEntry } from '../../../types'
import { notification } from 'antd'
import { getGages, getGageSources } from '../../../controllers'

type GageContextData = {
  gages: Gage[]
  gageSources: GageEntry[]
  loadGageSources: (state: string) => Promise<void>
  loadGages: () => Promise<void>
}

export const GageContext = createContext({} as GageContextData)

export const useGages = (): GageContextData => {
  const [gages, setGages] = useState<Gage[]>([])
  const [gageSources, setGageSources] = useState<GageEntry[]>([])

  const loadGages = async () => {
    try {
      const result = await getGages()
      setGages(result)
    } catch (e) {
      console.log(e)
    }
  }

  const loadGageSources = async (state: string) => {
    try {
      const {
        sources: { gages },
      } = await getGageSources(state)
      setGageSources(gages)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadGages()
    })()
  }, [])

  return {
    gages,
    gageSources,
    loadGageSources,
    loadGages,
  }
}

export const useGagesContext = (): GageContextData => useContext(GageContext)
