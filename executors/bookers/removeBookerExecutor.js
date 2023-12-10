const {Booker} = require("../../database/database");
const {logger} = require("../../logs/logger");
const {updateBookersList} = require("../../helpers");

module.exports = {
  removeBookerExecutor: async (interaction, client) => {
    try {
      await interaction.deferReply({ephemeral: true});

      let employee = interaction.options.getUser('сотрудник');

      await Booker.destroy({
        where: {
          user_id: employee.id
        }
      });

      await updateBookersList(client);

      await interaction.editReply({content: "Сотрудник удален!"});
    } catch (error) {
      logger.error(error);
    }
  }
};