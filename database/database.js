const {Sequelize, DataTypes} = require("sequelize");
const dotenv = require('dotenv');
const {logger} = require("../logs/logger");
const {FactionType} = require("../constants/FactionType");
const {SupplyType} = require("../constants/SupplyType");
const {SupplyStatus} = require("../constants/SupplyStatus");
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
    logging: false
  }
);

const Booker = sequelize.define('bookers', {
  user_id: DataTypes.STRING,
  supply_type: {
    type: DataTypes.ENUM,
    values: Object.values(SupplyType)
  },
}, {
  indexes: [
    {
      name: 'user_id_index',
      using: 'BTREE',
      fields: ['user_id']
    },
    {
      name: 'supply_type_index',
      using: 'BTREE',
      fields: ['supply_type']
    },
  ]
});

const Supply = sequelize.define('supplies', {
  type: {
    type: DataTypes.ENUM,
    values: Object.values(SupplyType)
  },
  faction: {
    type: DataTypes.ENUM,
    values: Object.values(FactionType)
  },
  size: DataTypes.INTEGER,
  time: DataTypes.TIME,
  author_id: DataTypes.STRING,
  reviewer_id: {
    type: DataTypes.STRING,
    nullable: true,
  },
  screenshot_url: DataTypes.STRING,
  message_id: {
    type: DataTypes.STRING,
    nullable: true,
  },
  is_reviewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(SupplyStatus)
  },
  is_finished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  indexes: [
    {
      name: 'author_id_index',
      using: 'BTREE',
      fields: ['author_id']
    },
    {
      name: 'reviewer_id_index',
      using: 'BTREE',
      fields: ['reviewer_id']
    },
    {
      name: 'type_index',
      using: 'BTREE',
      fields: ['type']
    },
    {
      name: 'faction_index',
      using: 'BTREE',
      fields: ['faction']
    },
  ]
});

// const ChannelsList = sequelize.define('channels_list', {
//   name: DataTypes.STRING,
//   channel_id: DataTypes.STRING,
//   channel_type: DataTypes.INTEGER
// });

module.exports = {
  async syncDatabase () {
    await sequelize.authenticate()
      .then(async () => {
        await Supply.sync({alter: true});
        await Booker.sync({alter: true});
        // await ChannelsList.sync({alter: true});
        console.log("=> Connection to database has been established successfully");
      })
      .catch(error => {
        logger.error(error);
        console.log("=> sqlite connection error", error);
      });
  },
  Supply,
  Booker
};