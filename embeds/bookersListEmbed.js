const {EmbedBuilder} = require("discord.js");

module.exports = {
  bookersListEmbed: (emsEmployees, armyEmployees) => {
    return {
      color: 0xffffff,
      title: "Список сотрудников для заказа поставок",
      fields: [
        {
          name: "EMS",
          value: getEmployeesListString(emsEmployees),
        },
        {
          name: "",
          value: ""
        },
        {
          name: "ARMY",
          value: getEmployeesListString(armyEmployees)
        }
      ]
    };
  },
};

function getEmployeesListString(arrayList) {
  let result = '';
  arrayList.forEach((item, key) => {
    result += `\n${key + 1}. <@${item.user_id}>`
  });
  return result;
}