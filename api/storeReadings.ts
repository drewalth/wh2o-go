import { Reading } from "./database/database";
import { GageReading } from "../types";

export const storeReadings = async (readings: GageReading[]) => {
  return await Reading.bulkCreate(readings);
};
