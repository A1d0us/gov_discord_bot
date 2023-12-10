const {logger} = require("../logs/logger");
const {Supply} = require("../database/database");
const {upload} = require("../helpers");
const {supplyEmbed} = require("../embeds/supplyEmbed");
const {textEmbed} = require("../embeds/textEmbed");
const dotenv = require("dotenv");
const {ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const moment = require("moment");
dotenv.config();

module.exports = {
  changeSupplyTimeExecutor: async (message, client) => {
    try {
      if (message.content.toUpperCase().includes('!CTIME')) {
        let splitMessage = message.content.split(' ');
        let newTime = splitMessage[1];

        let latestSupply = await Supply.findOne({
          where: {
            author_id: message.author.id,
          },
          order: [
            ['id', 'DESC']
          ]
        });

        if (latestSupply.is_reviewed) {
          message.author.send({embeds: [textEmbed("Поставка уже была рассмотрена!")]});
          return;
        }

        if (!/^(2[0-3]|[0-1]?\d):[0-5]\d$/.test(newTime)) {
          message.author.send({embeds: [textEmbed("Формат времени указан неверно!")]});
          return;
        }

        let channel = await client.channels.fetch(process.env.SUPPLIES_LIST_CHANNEL_ID);
        let supplyMessage = await channel.messages.cache.get(latestSupply.message_id);
        await latestSupply.update({time: newTime});
        await supplyMessage.edit({
          content: `<@&${process.env.SUPPLIES_TAG_ROLE_ID}>`,
          embeds: [supplyEmbed(latestSupply.type, latestSupply.faction, latestSupply.size, latestSupply.time.slice(0, 5), latestSupply.author_id, latestSupply.screenshot_url)],
        });
        message.author.send({embeds: [textEmbed("Время поставки было изменено!")]});
      }
    } catch (error) {
      logger.error(error);
    }
  }
};