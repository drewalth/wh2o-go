import { NextApiRequest, NextApiResponse } from "next";
import { gages } from "../../lib";
import { Gage, USGSStateGageHelper } from "../../types";

type Data = {
  sources: USGSStateGageHelper | undefined;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const sources = gages.find((source) => source.state === req.query.state);
  res.status(200).json({ sources });
}
