/* eslint-disable no-unused-vars */

export enum Endpoints {
  GAGE = '/gages',
  ALERT = '/alerts',
  GAGE_SOURCES = '/gage-sources',
  SETTINGS = '/user',
  EXPORT = '/export',
  IMPORT = '/import',
  LIB = '/lib',
}

export enum AlertInterval {
  DAILY = 'DAILY',
  IMMEDIATE = 'IMMEDIATE',
}

export enum AlertCriteria {
  ABOVE = 'ABOVE',
  BELOW = 'BELOW',
  BETWEEN = 'BETWEEN',
}

export enum AlertChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}
