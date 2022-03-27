import { Gage } from '../types';

/**
 * For displaying Gage reading value. Display fallback, "disabled", or reading value and gage metric.
 * @param gage
 */
export const formatGageReading = (gage: Gage): string => {
  const { Reading, Metric } = gage;

  if (Reading === null) {
    return '-';
  }

  if (Reading === -999999) {
    return 'Disabled';
  }

  return `${Reading} ${Metric}`;
};
