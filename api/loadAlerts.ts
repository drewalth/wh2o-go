import { Alert as AlertModel } from './database/database';
import { Alert } from '../types';

export const loadAlerts = async (): Promise<Alert[]> => {
  const alerts = await AlertModel.findAll();

  // @ts-ignore
  return alerts.map((el) => el.dataValues);
};
