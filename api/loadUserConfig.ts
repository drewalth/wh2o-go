import { UserConfig as UserConfigModel } from './database/database';
import { UserConfig } from '../types';

export const loadUserConfig = async (): Promise<UserConfig> => {
  // @ts-ignore
  return UserConfigModel.findOne({
    where: { id: 1 },
  });
};
