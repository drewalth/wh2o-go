import { Reading } from "./database/database";

export const cleanReadings = async () => {
  const readings = await Reading.findAll();
  // @ts-ignore
  const formattedReadings = readings.map((r) => r.dataValues);

  console.debug(formattedReadings);
};
