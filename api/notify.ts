import {GageReading} from "../types";
import {Alert} from "./database/database";


export const notify = async (readings: GageReading[]) => {
    // @ts-ignore
    const alerts = await Alert.findAll().then(res => res.map(v => v.dataValues))
    console.debug('alerts: ', alerts)
}
