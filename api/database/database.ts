import { DataTypes, Sequelize } from 'sequelize';
import sqlite3 from 'sqlite3';

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
});

export const USGSFetchSchedule = sequelize.define(
  'usgs_fetch_schedule',
  {
    nextFetch: DataTypes.DATE,
  },
  {
    timestamps: false,
  },
);

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
    lastSent: DataTypes.DATE,
  },
  {
    timestamps: false,
  },
);

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
  },
);

export const Gage = sequelize.define(
  'gage',
  {
    name: DataTypes.STRING,
    siteId: DataTypes.STRING,
    source: DataTypes.STRING,
    metric: {
      type: DataTypes.STRING,
      defaultValue: 'CFS',
      comment: 'The gage primary metric',
    },
    reading: DataTypes.INTEGER,
    delta: DataTypes.INTEGER,
    lastFetch: DataTypes.DATE,
  },
  {
    timestamps: true,
  },
);

export const UserConfig = sequelize.define(
  'user_config',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    mailgunKey: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
    },
    emailAddress: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
    },
    mailgunDomain: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
    },
    twilioAccountSID: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
    },
    twilioAuthToken: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
    },
    twilioMessagingServiceSid: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
    },
    twilioSMSTelephoneNumberTo: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
    },
    twilioSMSTelephoneNumberFrom: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'America/Denver',
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'user_config',
  },
);

// associate gages and readings
Gage.hasMany(Reading);
Reading.belongsTo(Gage);

// associate gages and alerts
Gage.hasMany(Alert);
Alert.belongsTo(Gage, {
  constraints: false,
});
(async function () {
  await sequelize
    .query(
      `
  INSERT INTO user_config(id, emailAddress, mailgunDomain, mailgunKey) VALUES (1, "","", "")
`,
    )
    .catch(() => {});
  await sequelize.sync({ force: false });
})();
