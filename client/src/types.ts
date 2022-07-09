/* eslint-disable no-unused-vars */
import { AlertCriteria, AlertInterval, AlertChannel } from './enums'

export type UserConfig = {
  id: number
  email: string
  mailgunKey: string
  mailgunDomain: string
  timezone: string
  twilioAccountSID: string
  twilioAuthToken: string
  twilioPhoneNumberTo: string
  twilioPhoneNumberFrom: string
}

export type UserConfigDto = Omit<UserConfig, 'id'>

export type Alert = {
  id: number
  name: string
  active: boolean
  criteria: AlertCriteria
  interval: AlertInterval
  channel: AlertChannel
  metric: GageMetric
  minimum?: number
  maximum?: number
  value: number
  gageId: number
  userId: number
  notifyTime?: string
  nextSend?: Date
  updatedAt: Date
  createdAt: Date
  gage: Gage
}

export type CreateAlertDto = Omit<
  Alert,
  'createdAt' | 'updatedAt' | 'id' | 'gage' | 'gageId'
>

export type UpdateAlertDto = Omit<
  Alert,
  'createdAt' | 'nextSend' | 'id' | 'gage'
>

export enum GageSource {
  USGS = 'USGS',
  ENVIRONMENT_CANADA = 'ENVIRONMENT_CANADA',
  ENVIRONMENT_AUCKLAND = 'ENVIRONMENT_AUCKLAND',
  ENVIRONMENT_CHILE = 'ENVIRONMENT_CHILE',
}

export type GageReading = {
  id?: number
  siteId: string
  value: number
  metric: GageMetric
  gageID: number
  gageName: string
  createdAt?: Date
  updatedAt?: Date
}

export type Gage = {
  id: number
  name: string
  source: GageSource
  siteId: string
  metric: GageMetric
  reading: number
  readings: GageReading[]
  delta: number
  lastFetch: Date
  createdAt: Date
  updatedAt: Date
  alerts?: Alert[]
}

export type UpdateGageDto = Omit<
  Gage,
  'id' | 'alerts' | 'updatedAt' | 'lastFetch' | 'createdAt'
>

export type CreateGageDto = {
  name: string
  siteId: string
  metric: GageMetric
  userId: number
  country: Country
  state: string
  source: GageSource
}

export type RequestStatus = 'loading' | 'success' | 'failure'

export type GageEntry = {
  gageName: string
  siteId: string
}

export enum GageMetric {
  CFS = 'CFS',
  FT = 'FT',
  TEMP = 'TEMP',
}

export type ExportData = {
  gages: Gage[]
  alerts: Alert[]
}

export type ExportDataDto = {
  gages: boolean
  alerts: boolean
  settings: boolean
}

export enum Country {
  US = 'US',
  CA = 'CA',
  NZ = 'NZ',
  CL = 'CL',
}
