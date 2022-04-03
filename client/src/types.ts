/* eslint-disable no-unused-vars */
import { AlertCriteria, AlertInterval, AlertChannel } from "./enums"

export type UserConfig = {
  ID: number;
  Email: string;
  MailgunKey: string;
  MailgunDomain: string;
  Timezone: string;
  TwilioAccountSID: string;
  TwilioAuthToken: string;
  TwilioPhoneNumberTo: string;
  TwilioPhoneNumberFrom: string;
};

export type UserConfigDto = Omit<UserConfig, 'ID'>;

export type Alert = {
  ID: number;
  Name: string;
  Active: boolean
  Criteria: AlertCriteria;
  Interval: AlertInterval;
  Channel: AlertChannel;
  Metric: GageMetric;
  Minimum?: number;
  Maximum?: number;
  Value: number;
  GageID: number;
  UserID: number;
  NotifyTime?: string;
  NextSend?: Date;
  UpdatedAt: Date;
  CreatedAt: Date;
  Gage: Gage;
};

export type CreateAlertDto = Omit<Alert,
  'CreatedAt' |
  'UpdatedAt' |
  'ID' |
  'GageID' | 'Gage'
>

export type UpdateAlertDto = Omit<Alert,
  'CreatedAt' |
  'NextSend' |
  'ID' |
  'Gage'
>

export enum GageSource {
  USGS = 'usgs',
}

export type GageReading = {
  ID?: number;
  SiteId: string;
  Value: number;
  Metric: GageMetric;
  GageID: number;
  GageName: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
};

export type ExportDataDto = {
  gages: boolean;
  alerts: boolean;
  settings: boolean;
};

export type Gage = {
  ID: number;
  Name: string;
  source: GageSource;
  SiteId: string;
  Metric: GageMetric;
  Reading: number;
  Readings: GageReading[];
  Delta: number;
  LastFetch: Date;
  CreatedAt: Date;
  UpdatedAt: Date;
  Alerts?: Alert[];
};

export type UpdateGageDto = Omit<Gage, 'ID' | 'Alerts' | 'UpdatedAt' | 'LastFetch' | 'CreatedAt'>

export interface CreateGageDto {
  Name: string;
  SiteId: string;
  Metric: GageMetric;
}

export interface GageUpdateDTO {
  latitude: number;
  longitude: number;
  siteId: string;
  gageId: number;
  metric: GageMetric;
  name: string;
  reading: number;
  tempC: number;
  tempF: number;
}

export type RequestStatus = 'loading' | 'success' | 'failure';

export type GageEntry = {
  gageName: string;
  siteId: string;
};

export type USGSStateGageHelper = {
  state: string;
  gages: GageEntry[];
};

export type usState = {
  name: string;
  abbreviation: string;
};

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

export type USGSGageUnitCode = 'ft3/s' | 'ft' | 'deg C';

export type USGSGageReadingValue = {
  value: {
    value: string;
    qualifiers: string[];
    dateTime: string;
  }[];
  qualifier: {
    qualifierCode: string;
    qualifierDescription: string;
    qualifierID: number;
    network: string;
    vocabulary: string;
  }[];
  qualityControlLevel: unknown[];
  method: {
    methodDescription: string;
    methodID: number;
  }[];
  source: unknown[];
  offset: unknown[];
  sample: unknown[];
  censorCode: unknown[];
};

export type USGSTimeSeries = {
  sourceInfo: {
    siteName: string;
    siteCode: {
      value: string;
      network: string;
      agencyCode: string;
    }[];
    timeZoneInfo: {
      defaultTimeZone: {
        zoneOffset: string;
        zoneAbbreviation: string;
      };
      daylightSavingsTimeZone: {
        zoneOffset: string;
        zoneAbbreviation: string;
      };
      siteUsesDaylightSavingsTime: boolean;
    };
    geoLocation: {
      geogLocation: {
        srs: string;
        latitude: number;
        longitude: number;
      };
      localSiteXY: unknown[];
    };
    note: unknown[];
    siteType: unknown[];
    siteProperty: {
      name: string;
      value: string;
    }[];
  };
  variable: {
    variableCode: {
      value: USGSGageReadingVariable;
      network: string;
      vocabulary: string;
      variableID: number;
      default: boolean;
    }[];
    variableName: string;
    variableDescription: string;
    valueType: string;
    unit: {
      unitCode: USGSGageUnitCode;
    };
    options: {
      option: {
        name: string;
        optionCode: string;
      }[];
    };
    note: unknown[];
    noDataValue: number;
    variableProperty: unknown[];
    oid: string;
  };
  values: USGSGageReadingValue[];
  name: string;
};

export type USGSGageData = {
  name: string;
  declaredType: string;
  scope: string;
  value: {
    queryInfo: {
      queryURL: string;
      criteria: {
        locationParam: string;
        variableParam: string;
        parameter: unknown[];
      };
      note: { value: string; title: string }[];
    };
    timeSeries: USGSTimeSeries[];
  };
  nil: boolean;
  globalScope: boolean;
  typeSubstituted: boolean;
};

export type ExportData = {
  gages: Gage[]
  alerts: Alert[]
}