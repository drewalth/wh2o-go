import { Gage } from '../../types'
import { NextApiRequest, NextApiResponse } from 'next'
import { handleRequest } from '../../lib/handleRequest'
import { ClimbingAreaForecast } from '../../api/database/database'

type Data = {
  gages: Gage[] | undefined
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await handleRequest(ClimbingAreaForecast, req, res)
}
