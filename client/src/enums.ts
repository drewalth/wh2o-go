/* eslint-disable no-unused-vars */

export enum Endpoints {
  GAGE = '/gages',
  ALERT = '/alerts',
  GAGE_SOURCES = '/gage-sources',
  SETTINGS = '/user',
  EXPORT = '/export',
  IMPORT = "/import",
  LIB = "/lib"
}

export enum AlertInterval {
  DAILY = 'daily',
  IMMEDIATE = 'immediate',
}

export enum AlertCriteria {
  ABOVE = 'above',
  BELOW = 'below',
  BETWEEN = 'between',
}

export enum AlertChannel {
  EMAIL = 'email',
  SMS = 'sms',
}