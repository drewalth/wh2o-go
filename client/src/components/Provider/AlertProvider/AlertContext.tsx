import { Alert, RequestStatus } from '../../../types'
import { createContext, useEffect, useState, useContext } from 'react'
import { getAlerts } from '../../../controllers'

type AlertContextData = {
  alerts: Alert[]
  loadAlerts: () => Promise<void>
  requestStatus: RequestStatus
}

export const AlertContext = createContext({} as AlertContextData)

export const useAlert = (): AlertContextData => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('loading')

  const loadAlerts = async () => {
    try {
      setRequestStatus('loading')
      const alerts = await getAlerts()
      setAlerts(alerts)
      setRequestStatus('success')
    } catch (e) {
      setRequestStatus('failure')
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadAlerts()
    })()
  }, [])

  return {
    alerts,
    loadAlerts,
    requestStatus,
  }
}

export const useAlertsContext = (): AlertContextData => useContext(AlertContext)
