import {
  Gage,
  GageMetric,
  GageReading,
  USGSGageData,
  USGSGageReadingVariable,
} from '../types';

export const formatGageReadings = (
  gageData: USGSGageData,
  gages: Gage[],
): GageReading[] => {
  return gageData?.value?.timeSeries.map((item) => {
    const numberOfValues = item.values.length;
    const latestReading = parseInt(
      item.values[numberOfValues - 1].value[0].value,
    );
    const parameter = item.variable.variableCode[0].value;

    let metric: GageMetric = GageMetric.CFS;
    if (parameter === USGSGageReadingVariable.CFS) {
      metric = GageMetric.CFS;
    } else if (parameter === USGSGageReadingVariable.FT) {
      metric = GageMetric.FT;
    } else if (parameter === USGSGageReadingVariable.DEG_CELCIUS) {
      metric = GageMetric.TEMP;
    }

    const siteId = item.sourceInfo.siteCode[0].value;
    // @ts-ignore
    const gageId = gages.find((item) => item.siteId === siteId).id;

    return {
      // latitude,
      // longitude,
      siteId,
      gageId,
      metric,
      gageName: item.sourceInfo.siteName,
      value: latestReading,
      // difference: !temperature ? (latest - old) : 0,
      // tempC: temperature,
      // tempF: temperature ? temperature * 1.8 + 32 : null,
    };
  });
};
