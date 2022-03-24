import { Alert, Gage as GageModel } from './database/database';
import { AlertInterval, Gage } from '../types';

export const loadGages = async (): Promise<Gage[]> => {
  const gages = await GageModel.findAll({
    include: [
      {
        model: Alert,
        required: false,
        where: {
          interval: AlertInterval.IMMEDIATE,
        },
      },
    ],
  });

  // @ts-ignore
  return gages.map((el) => el.dataValues);
};
