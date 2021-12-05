import { DateTime } from 'luxon'

export type GageFetchSchedule = {
  nextFetch: DateTime
}

export type FetchInterval = 1 | 2 | 5 | 10 | 15 | 30

export type UserConfig = {
  EMAIL_ADDRESS: string
  MAILGUN_API_KEY: string
  MAILGUN_DOMAIN: string
}

export type AlertInterval = 'daily' | 'immediate'

export type AlertCriteria = 'above' | 'below' | 'between'

export type AlertChannel = 'email' | 'sms'

export type Alert = {
  id: number
  name: string
  criteria: AlertCriteria
  interval: AlertInterval
  channel: AlertChannel
  metric: GageMetric
  minimum?: number
  maximum?: number
  value: number
  gageId: number
  notifyTime: Date
  nextSend: Date
}

export type CreateAlertDTO = {
  notifyTime?: Date
  nextSend?: Date
} & Omit<Alert, 'id' | 'notifyTime' | 'nextSend'>

export enum GageSource {
  USGS = 'usgs',
}

export type GageReading = {
  id?: number
  siteId: string
  value: number
  metric: GageMetric
  gageId: number
  gageName: string
  createdAt?: Date
  updatedAt?: Date
}

export type Gage = {
  id: number
  name: string
  source: GageSource
  siteId: string
  metric: string
  reading: number
  readings: GageReading[]
  delta: number
  lastFetch: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateGageDto {
  name: string
  siteId: string
}

export interface GageUpdateDTO {
  latitude: number
  longitude: number
  siteId: string
  gageId: number
  metric: GageMetric
  name: string
  reading: number
  tempC: number
  tempF: number
}

export type RequestStatus = 'loading' | 'success' | 'failure'

export type GageEntry = {
  gageName: string
  siteId: string
}

export type USGSStateGageHelper = {
  state: string
  gages: GageEntry[]
}

export type usState = {
  name: string
  abbreviation: string
}

export enum GageMetric {
  CFS = 'CFS',
  FT = 'FT',
  TEMP = 'TEMP',
}

export enum USGSGageReadingVariable {
  CFS = '00060',
  FT = '00065',
  DEG_CELCIUS = '00010',
}

export type USGSGageUnitCode = 'ft3/s' | 'ft' | 'deg C'

export type USGSGageReadingValue = {
  value: {
    value: string
    qualifiers: string[]
    dateTime: string
  }[]
  qualifier: {
    qualifierCode: string
    qualifierDescription: string
    qualifierID: number
    network: string
    vocabulary: string
  }[]
  qualityControlLevel: unknown[]
  method: {
    methodDescription: string
    methodID: number
  }[]
  source: unknown[]
  offset: unknown[]
  sample: unknown[]
  censorCode: unknown[]
}

export type USGSTimeSeries = {
  sourceInfo: {
    siteName: string
    siteCode: {
      value: string
      network: string
      agencyCode: string
    }[]
    timeZoneInfo: {
      defaultTimeZone: {
        zoneOffset: string
        zoneAbbreviation: string
      }
      daylightSavingsTimeZone: {
        zoneOffset: string
        zoneAbbreviation: string
      }
      siteUsesDaylightSavingsTime: boolean
    }
    geoLocation: {
      geogLocation: {
        srs: string
        latitude: number
        longitude: number
      }
      localSiteXY: unknown[]
    }
    note: unknown[]
    siteType: unknown[]
    siteProperty: {
      name: string
      value: string
    }[]
  }
  variable: {
    variableCode: {
      value: USGSGageReadingVariable
      network: string
      vocabulary: string
      variableID: number
      default: boolean
    }[]
    variableName: string
    variableDescription: string
    valueType: string
    unit: {
      unitCode: USGSGageUnitCode
    }
    options: {
      option: {
        name: string
        optionCode: string
      }[]
    }
    note: unknown[]
    noDataValue: number
    variableProperty: unknown[]
    oid: string
  }
  values: USGSGageReadingValue[]
  name: string
}

export type USGSGageData = {
  name: string
  declaredType: string
  scope: string
  value: {
    queryInfo: {
      queryURL: string
      criteria: {
        locationParam: string
        variableParam: string
        parameter: unknown[]
      }
      note: { value: string; title: string }[]
    }
    timeSeries: USGSTimeSeries[]
  }
  nil: boolean
  globalScope: boolean
  typeSubstituted: boolean
}
