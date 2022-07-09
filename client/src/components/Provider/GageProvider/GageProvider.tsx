import React, { ReactNode, useEffect, useState } from 'react'
import { GageContext } from './GageContext'
import { Country, Gage, GageEntry } from '../../../types'
import { getGages, getGageSources } from '../../../controllers'
import { notification } from 'antd'

type GageProviderProps = {
  children: ReactNode
}

export const GageProvider = ({ children }: GageProviderProps): JSX.Element => {
  const [gages, setGages] = useState<Gage[]>([])
  const [gageSources, setGageSources] = useState<GageEntry[]>([])

  const loadGages = async () => {
    try {
      const result = await getGages()
      setGages(result)
    } catch (e) {
      notification.error({
        message: 'Failed to load gages',
        placement: 'bottomRight',
      })
    }
  }

  const loadGageSources = async (country: Country, state: string) => {
    try {
      const gages = await getGageSources(country, state)
      setGageSources(gages)
    } catch (e) {
      notification.error({
        message: 'Failed to gage sources',
        placement: 'bottomRight',
      })
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadGages()
    })()
  }, [])

  return (
    <GageContext.Provider
      value={{
        gages,
        gageSources,
        loadGageSources,
        loadGages,
      }}
    >
      {children}
    </GageContext.Provider>
  )
}
