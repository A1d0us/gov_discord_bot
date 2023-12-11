const {logger} = require("../logs/logger");
const {Supply} = require("../database/database");
const {textEmbed} = require("../embeds/textEmbed");
const {supplyEmbed} = require("../embeds/supplyEmbed");
const {SupplyStatus} = require("../constants/SupplyStatus");

module.exports = {
  cancelSupplyByMessageExecutor: async (message, client) => {
    try {
      if (message.content.toUpperCase().includes('!CANCEL')) {
        let latestSupply = await Supply.findOne({
          where: {
            author_id: message.author.id,
          },
          order: [
            ['id', 'DESC']
          ]
        });

        if (latestSupply.is_reviewed || latestSupply.is_finished) {
          message.author.send({embeds: [textEmbed("Поставка уже была рассмотрена!")]});
          return;
        }

        await latestSupply.update({
          is_reviewed: true,
          status: SupplyStatus.REJECTED,
          is_finished: true
        });

        let channel = await client.channels.fetch(process.env.SUPPLIES_LIST_CHANNEL_ID);
        let supplyMessage = await channel.messages.cache.get(latestSupply.message_id);
        let reason = "Поставка была отменена в связи с инициативой заказчика";
        await supplyMessage.edit({
          content: `<@&${process.env.SUPPLIES_TAG_ROLE_ID}>`,
          embeds: [supplyEmbed(latestSupply,0xc41e3a, reason)],
          components: []
        });

        await message.author.send({embeds: [textEmbed("Поставка была отклонена!","Причина: " + reason, 0xc41e3a)]});
      }
    } catch (error) {
      logger.error(error);
    }
  }
};