const {logger} = require("../logs/logger");
const {Supply} = require("../database/database");
const {TextInputBuilder, TextInputStyle, ModalBuilder, ActionRowBuilder} = require("discord.js");

module.exports = {
  cancelSupplyExecutor: async (supplyId, interaction) => {
    try {
      const textInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel("Введите причину")
        .setStyle(TextInputStyle.Paragraph);

      const modal = new ModalBuilder()
        .setCustomId('cancel_supply_modal_' + supplyId)
        .setTitle('Отклонить поставку');

      let firstRow = new ActionRowBuilder().addComponents(textInput);
      modal.addComponents(firstRow);
      await interaction.showModal(modal);
    } catch (error) {
      logger.error(error);
    }
  }
};