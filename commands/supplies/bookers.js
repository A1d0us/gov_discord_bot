const {SlashCommandBuilder} = require("@discordjs/builders");
const {SupplyType} = require("../../constants/SupplyType");
const {addBookerExecutor} = require("../../executors/bookers/addBookerExecutor");
const {removeBookerExecutor} = require("../../executors/bookers/removeBookerExecutor");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bookers')
    .setDescription('Управление списком тех, кто может заказать поставку')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Добавить человека в список')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Тип поставки')
            .setRequired(true)
            .addChoices(
              {name: "EMS", value: SupplyType.EMS},
              {name: "ARMY", value: SupplyType.ARMY},
            )
        )
        .addUserOption(
          option =>
            option
              .setName('employee')
              .setDescription('Тег сотрудника')
              .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Убрать человека из списка')
        .addUserOption(
          option =>
            option
              .setName('employee')
              .setDescription('Тег сотрудника')
              .setRequired(true)
        )
    ),
  async execute({client, interaction}) {
    switch (interaction.options.getSubcommand()) {
      case 'add':
        await addBookerExecutor(interaction, client);
        break;
      case 'remove':
        await removeBookerExecutor(interaction, client);
        break;
    }
  }
};