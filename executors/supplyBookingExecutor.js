const {logger} = require("../logs/logger");
const {Supply, Booker} = require("../database/database");
const {upload} = require("../helpers");
const {supplyEmbed} = require("../embeds/supplyEmbed");
const {textEmbed} = require("../embeds/textEmbed");
const dotenv = require("dotenv");
const {FactionType} = require("../constants/FactionType");
const {ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {SupplyStatus} = require("../constants/SupplyStatus");
dotenv.config();

module.exports = {
  supplyBookingExecutor: async (message, client) => {
    try {
      if (message.content.toUpperCase().includes('!EMS') || message.content.toUpperCase().includes('!ARMY')) {
        let splitMessage = message.content.split(' ');
        let supplyType = splitMessage[0].slice(1).toUpperCase();
        let faction = splitMessage[1].toUpperCase();
        let size = splitMessage[2];
        let time = splitMessage[3];

        let bookingRecord = await Booker.findOne({
          where: {
            supply_type: supplyType,
            user_id: message.author.id,
          }
        });
        if (!bookingRecord) {
          message.author.send({embeds: [textEmbed("Вы не можете заказать такую поставку!")]});
          return;
        }

        if (!Object.values(FactionType).includes(faction)) {
          message.author.send({embeds: [textEmbed("Фракция введена неверно!")]});
          return;
        }
        if (supplyType === 'ARMY' && faction === FactionType.EMS) {
          message.author.send({embeds: [textEmbed("Материалы в EMS не нужны!")]});
          return;
        }

        if (!/^(2[0-3]|[0-1]?\d):[0-5]\d$/.test(time)) {
          message.author.send({embeds: [textEmbed("Формат времени указан неверно!")]});
          return;
        }

        let attachment = message.attachments.first();

        if (!!attachment) {
          let imageLink = await upload(attachment.url, attachment.name);
          if (!!imageLink) {
            let supply = await Supply.create({
              type: supplyType,
              faction,
              size,
              time,
              author_id: message.author.id,
              screenshot_url: imageLink,
              status: SupplyStatus.CREATED
            });

            const confirm = new ButtonBuilder()
              .setCustomId('supply_confirm_' + supply.id)
              .setStyle(ButtonStyle.Success)
              .setLabel('Одобрить');

            const cancel = new ButtonBuilder()
              .setCustomId('supply_cancel_' + supply.id)
              .setStyle(ButtonStyle.Danger)
              .setLabel('Отказать');

            const row = new ActionRowBuilder()
              .addComponents(confirm, cancel);

            let channel = await client.channels.fetch(process.env.SUPPLIES_LIST_CHANNEL_ID);
            let supplyMessage = await channel.send({
              content: `<@&${process.env.SUPPLIES_TAG_ROLE_ID}>`,
              embeds: [supplyEmbed(supply)],
              components: [row]
            });
            await supply.update({message_id: supplyMessage.id});
            message.author.send({embeds: [textEmbed("Заказ отправлен!", "Для смены времени используйте команду !ctime (Время)")]});
          }
        } else {
          message.author.send({embeds: [textEmbed("Не прикреплён скриншот склада!")]});
        }
      }
    } catch (error) {
      logger.error(error);
    }
  }
};