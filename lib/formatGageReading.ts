import { Gage } from '../types';

/**
 * For displaying Gage reading value. Display fallback, "disabled", or reading value and gage metric.
 * @param gage
 */
export const formatGageReading = (gage: Gage): string => {
  const { reading, metric } = gage;

  if (reading === null) {
    return '-';
  }

  if (reading === -999999) {
    return 'Disabled';
  }

  return `${reading} ${metric}`;
};
