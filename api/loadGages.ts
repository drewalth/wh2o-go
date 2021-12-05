import { Gage as GageModel } from './database/database'
import { Gage } from '../types'

export const loadGages = async (): Promise<Gage[]> => {
  const gages = await GageModel.findAll()

  // @ts-ignore
  return gages.map((el) => el.dataValues)
}
