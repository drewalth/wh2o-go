import { ClimbingArea as ClimbingAreaModel } from './database/database';
import { ClimbingArea } from '../types';

export const loadClimbingAreas = async (): Promise<ClimbingArea[]> => {
  return await ClimbingAreaModel.findAll().then((res) =>
    // @ts-ignore
    res.map((el) => el.dataValues),
  );
};
