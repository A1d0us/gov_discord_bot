const dotenv = require("dotenv");
const imgBBUploader = require('imgbb-uploader');
const {Booker} = require("./database/database");
const {SupplyType} = require("./constants/SupplyType");
const {bookersListEmbed} = require("./embeds/bookersListEmbed");
const {logger} = require("./logs/logger");
const {post} = require("axios");
dotenv.config();
const {MessageType} = require("discord.js");
const fs = require("fs");

module.exports = {
  async updateBookersList(client) {
    let channel = await client.channels.fetch(process.env.BOOKERS_LIST_CHANNEL_ID);
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
    let messages = channel.messages.cache.filter(message => message.type !== MessageType.ChatInputCommand);
    let message = messages.first();
    if (!!message) {
      await message.edit({embeds: [bookersListEmbed(emsEmployees, armyEmployees)]});
    } else  {
      let fetched;
      do {
        fetched = await channel.messages.fetch({limit: 100});
        await channel.bulkDelete(fetched);
      } while(fetched.size >= 2);
      await channel.send({embeds: [bookersListEmbed(emsEmployees, armyEmployees)]});
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