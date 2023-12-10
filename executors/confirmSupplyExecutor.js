const {logger} = require("../logs/logger");
const {Supply} = require("../database/database");
const {textEmbed} = require("../embeds/textEmbed");
const {supplyEmbed} = require("../embeds/supplyEmbed");
const {SupplyStatus} = require("../constants/SupplyStatus");
const moment = require("moment-timezone");
module.exports = {
  confirmSupplyExecutor: async (supplyId, interaction, client) => {
    try {
      await interaction.deferReply({ephemeral: true});
      let supply = await Supply.findOne({
        where: {
          id: supplyId
        }
      });

      let time = moment().tz('Europe/Moscow').format('HH:mm');
      let splitSupplyTime = supply.time.split(':');
      let splitLocalTime = time.split(':');

      if (splitSupplyTime[0] === splitLocalTime[0] && Math.abs(splitSupplyTime[1] - splitLocalTime[1]) <= 5) {
        await supply.update({
          is_reviewed: true,
          reviewer_id: interaction.user.id,
          status: SupplyStatus.APPROVED
        });

        let member = await interaction.guild.members.fetch({force: true})
          .then(members => {
            return members.find(item => item.user.id === supply.author_id);
          });

        let channel = await client.channels.fetch(process.env.SUPPLIES_LIST_CHANNEL_ID);
        let message = await channel.messages.cache.get(supply.message_id);
        await message.edit({
          content: `<@&${process.env.SUPPLIES_TAG_ROLE_ID}>`,
          embeds: [supplyEmbed(supply.type, supply.faction, supply.size, supply.time.slice(0, 5), supply.author_id, supply.screenshot_url, interaction.user.id, supply.status, 0x228b22)],
          components: []
        });

        await member.user.send({embeds: [textEmbed("Поставка была заказана!", null, 0x228b22)]});

        await interaction.editReply({content: "Поставка одобрена!"});
      } else {
        await interaction.editReply({content: "Поставку можно одобрить не раньше, чем за 5 минут!"});
      }
    } catch (error) {
      logger.error(error);
    }
  }
};