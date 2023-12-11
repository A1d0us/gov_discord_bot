const {SlashCommandBuilder} = require("@discordjs/builders");
const {logger} = require("../../logs/logger");
const {Supply: SupplyReport} = require("../../database/database");
const {supplyReportEmbed} = require("../../embeds/supplyReportEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('supply_report')
    .setDescription('Команды для поставок')
    .addIntegerOption(option =>
      option
        .setName('supply_number')
        .setDescription('Номер поставки')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('cars_count')
        .setDescription('Кол-во машин, которые доехали')
        .setRequired(true)
    ),
  async execute({client, interaction}) {
    try {
      await interaction.deferReply({ephemeral: true});
      let supplyId = interaction.options.getInteger('supply_number');
      let carsCount = interaction.options.getInteger('cars_count');
      let supply = await SupplyReport.findOne({
        where: {
          id: supplyId
        }
      });

      if (!supply) {
        await interaction.editReply({content: `Поставки с номером ${supplyId} не существует!`});
        return;
      }

      if (supply.is_finished) {
        await interaction.editReply({content: `Отчёт на эту поставку уже есть!`});
        return;
      }

      await supply.update({is_finished: true});

      await interaction.channel.send({embeds: [supplyReportEmbed(supply, carsCount, interaction.user.id)]});
      await interaction.editReply({content: "Отчёт на поставку был добавлен!"});
    } catch (error) {
      logger.error(error);
    }
  }
};