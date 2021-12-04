import { USGSGageData } from "../types";
import { http } from "../lib";

export const fetchGageReadings = async (
  siteIds: string[]
): Promise<USGSGageData> => {
  const formattedIds = siteIds.join(",");

  console.debug(formattedIds);

  return require("./mockGageResponse.json");

  // return http.get(`http://waterservices.usgs.gov/nwis/iv/?format=json&sites=${formattedIds}&parameterCd=00060,00065,00010&siteStatus=all`)
};
