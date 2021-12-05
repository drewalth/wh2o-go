import { DataTypes, Sequelize } from 'sequelize'
import sqlite3 from 'sqlite3'

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  dialectModule: sqlite3,
  host: 'localhost',
  storage: 'db.sqlite',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

export const USGSFetchSchedule = sequelize.define(
  'usgs_fetch_schedule',
  {
    nextFetch: DataTypes.DATE,
  },
  {
    timestamps: false,
  }
)

export const Alert = sequelize.define(
  'alert',
  {
    name: DataTypes.STRING,
    criteria: DataTypes.STRING,
    interval: DataTypes.STRING,
    channel: DataTypes.STRING,
    minimum: DataTypes.INTEGER,
    maximum: DataTypes.INTEGER,
    value: DataTypes.INTEGER,
    gageId: DataTypes.INTEGER,
    metric: DataTypes.STRING,
    category: DataTypes.STRING,
    notifyTime: DataTypes.DATE,
    nextSend: DataTypes.DATE,
  },
  {
    timestamps: false,
  }
)

export const Reading = sequelize.define(
  'reading',
  {
    value: DataTypes.INTEGER,
    gageId: DataTypes.INTEGER,
    metric: DataTypes.STRING,
    siteId: DataTypes.STRING,
    gageName: DataTypes.STRING,
  },
  {
    timestamps: true,
  }
)

export const Gage = sequelize.define(
  'gage',
  {
    name: DataTypes.STRING,
    siteId: DataTypes.STRING,
    source: DataTypes.STRING,
    metric: DataTypes.STRING,
    reading: DataTypes.INTEGER,
    delta: DataTypes.INTEGER,
    lastFetch: DataTypes.DATE,
  },
  {
    timestamps: true,
  }
)

export const ClimbingArea = sequelize.define(
  'climbing_area',
  {
    areaId: DataTypes.INTEGER,
    country: DataTypes.STRING,
    adminArea: DataTypes.STRING,
    name: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
)

export const ClimbingAreaForecast = sequelize.define(
  'climbing_area_forecast',
  {
    areaId: DataTypes.INTEGER,
    value: DataTypes.STRING,
  },
  {
    timestamps: true,
  }
)

export const UserConfig = sequelize.define(
  'user_config',
  {
    mergeDailyReports: DataTypes.BOOLEAN,
  },
  {
    timestamps: false,
  }
)

Gage.hasMany(Reading)
Reading.belongsTo(Gage)
;(async function () {
  await sequelize.sync({ force: false })
})()
