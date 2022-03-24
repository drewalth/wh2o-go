import { USGSGageData } from '../types';
import axios from 'axios';
import { MOCK_USGS_FETCH } from '../lib';

// bad variable name
const httpServer = axios.create();

export const fetchGageReadings = async (
  siteIds: string[],
): Promise<USGSGageData> => {
  if (siteIds.length === 0) {
    throw new Error('No siteIds provided');
  }
  const idsSet = new Set(siteIds);
  const formattedIds = [...idsSet].join(',');

  /**
   * use mocked response for development.
   */
  // if (Number(MOCK_USGS_FETCH)) {
  //   return require('./mockGageResponse.json');
  // }

  return httpServer
    .get(
      `http://waterservices.usgs.gov/nwis/iv/?format=json&sites=${formattedIds}&parameterCd=00060,00065,00010&siteStatus=all`,
    )
    .then((res) => res.data);
};
