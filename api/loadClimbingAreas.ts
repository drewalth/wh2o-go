import { ClimbingArea as ClimbingAreaModel } from './database/database'
import { ClimbingArea } from '../types'

export const loadClimbingAreas = async (): Promise<ClimbingArea[]> => {
  // @ts-ignore
  return await ClimbingAreaModel.findAll().then((res) =>
    res.map((el) => el.dataValues)
  )
}
