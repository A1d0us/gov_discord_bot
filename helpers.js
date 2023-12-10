const dotenv = require("dotenv");
const imgBBUploader = require('imgbb-uploader');
const {Booker} = require("./database/database");
const {SupplyType} = require("./constants/SupplyType");
const {bookersListEmbed} = require("./embeds/bookersListEmbed");
const {logger} = require("./logs/logger");
const {post} = require("axios");
dotenv.config();
const fs = require("fs");

module.exports = {
  async updateBookersList(client) {
    let channel = await client.channels.fetch(process.env.BOOKERS_LIST_CHANNEL_ID);
    let jsonConfig = fs.readFileSync('config.json', { encoding: 'utf8', flag: 'r' });
    let config = JSON.parse(jsonConfig);
    if (config.bookersListId) {
      let bookersList = await channel.messages.cache.get(config.bookersListId);
      let emsEmployees = await Booker.findAll({
        where: {
          supply_type: SupplyType.EMS
        }
      });
      let armyEmployees = await Booker.findAll({
        where: {
          supply_type: SupplyType.ARMY
        }
      });

      let message = await bookersList.edit({embeds: [bookersListEmbed(emsEmployees, armyEmployees)]});
      config.bookersListId = message.id;
      fs.writeFileSync('config.json', JSON.stringify(config));
    } else  {
      let emsEmployees = await Booker.findAll({
        where: {
          supply_type: SupplyType.EMS
        }
      });
      let armyEmployees = await Booker.findAll({
        where: {
          supply_type: SupplyType.ARMY
        }
      });

      let message = await channel.send({embeds: [bookersListEmbed(emsEmployees, armyEmployees)]});
      config.bookersListId = message.id;
      fs.writeFileSync('config.json', JSON.stringify(config));
    }
  },
  upload: async (url, name) => {
    try {
      let imgurResponse = await post('https://api.imgur.com/3/image', {
        image: url,
        type: 'url',
        name
      }, {
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        }
      })
        .then(response => response.data)
        .catch(error => {
          if (error.response.data.status !== 400) {
            logger.error(error);
          }
          return error.response.data;
        });

      if (imgurResponse.success) {
        return imgurResponse.data.link;
      } else {
        return await imgBBUploader({
          apiKey: process.env.IMGBB_KEY,
          name,
          imageUrl: url
        })
          .then(response => response.url)
          .catch(error => logger.error(error))
      }
    } catch (error) {
      logger.error(error);
    }
  },
};