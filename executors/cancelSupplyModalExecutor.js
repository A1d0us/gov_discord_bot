const {logger} = require("../logs/logger");
const {Supply} = require("../database/database");
const {textEmbed} = require("../embeds/textEmbed");
const {supplyEmbed} = require("../embeds/supplyEmbed");

module.exports = {
  cancelSupplyModalExecutor: async (supplyId, interaction, client) => {
    try {
      await interaction.deferReply({ephemeral: true});
      let supply = await Supply.findOne({
        where: {
          id: supplyId
        }
      });

      await supply.update({
        is_reviewed: true,
        reviewer_id: interaction.user.id
      });

      let reason = interaction.fields.getTextInputValue('reason');

      let channel = await client.channels.fetch(process.env.SUPPLIES_LIST_CHANNEL_ID);
      let message = await channel.messages.cache.get(supply.message_id);
      await message.edit({
        content: `<@&${process.env.SUPPLIES_TAG_ROLE_ID}>`,
        embeds: [supplyEmbed(supply.type, supply.faction, supply.size, supply.time.slice(0, 5), supply.author_id, supply.screenshot_url)],
        components: []
      });
      await interaction.editReply({content: "Поставка отклонена!"});

      let member = await interaction.guild.members.fetch({force: true})
        .then(members => {
          return members.find(item => item.user.id === supply.author_id);
        });

      await member.user.send({embeds: [textEmbed("Поставка была отклонена!","Причина: " + reason, 0xc41e3a)]});
    } catch (error) {
      logger.error(error);
    }
  }
};