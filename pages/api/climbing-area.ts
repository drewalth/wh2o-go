import { ClimbingArea } from '../../types'
import { NextApiRequest, NextApiResponse } from 'next'
import { handleRequest } from '../../lib/handleRequest'
import { ClimbingArea as ClimbingAreaModel } from '../../api/database/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClimbingArea[]>
) {
  await handleRequest(ClimbingAreaModel, req, res)
}
