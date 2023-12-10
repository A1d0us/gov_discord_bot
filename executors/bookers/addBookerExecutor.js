const {Booker} = require("../../database/database");
const {logger} = require("../../logs/logger");
const {updateBookersList} = require("../../helpers");
const {textEmbed} = require("../../embeds/textEmbed");

module.exports = {
  addBookerExecutor: async (interaction, client) => {
    try {
      await interaction.deferReply({ephemeral: true});

      let employee = interaction.options.getUser('сотрудник');
      let supplyType = interaction.options.getString('тип');

      let record = await Booker.findOne({
        where: {
          user_id: employee.id,
          supply_type: supplyType,
        }
      });
      if (!!record) {
        await interaction.editReply({content: "Сотрудник уже в списке"});
        return;
      }

      await Booker.create({
        user_id: employee.id,
        supply_type: supplyType
      });

      await updateBookersList(client);

      let commandDescription = `Для заказа поставки - !${supplyType} (Фракция) (Количество) (Время)\n` +
        `Пример: !${supplyType} LSPD 1000 16:50`;
      await employee.send({embeds: [textEmbed("Вы были добавлены в список поставки " + supplyType, commandDescription)]});
      await interaction.editReply({content: "Сотрудник добавлен!"});
    } catch (error) {
      logger.error(error);
    }
  }
};