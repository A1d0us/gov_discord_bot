const {SupplyStatus} = require("../constants/SupplyStatus");
module.exports = {
  supplyEmbed: (type, faction, size, time, authorId, imageLink, govEmployeeId, status = null, color = 0xfdda0d, reason = null) => {
    let statusFields = status ? [
      {
        name: "Статус",
        value: status,
        inline: true
      },
      {
        name: "Сотрудник GOV",
        value: `<@${govEmployeeId}>`,
        inline: true,
      },
    ] : [];
    if (status === SupplyStatus.REJECTED) {
      statusFields = [...statusFields, {
        name: "Причина отказа",
        value: reason,
        inline: true
      }]
    }
    return {
      title: "Заказ поставки " + type,
      color: color,
      fields: [
        {
          name: "Фракция",
          value: faction,
          inline: true
        },
        {
          name: "Размер",
          value: size,
          inline: true
        },
        {
          name: "Время заказа",
          value: time,
          inline: true
        },
        {
          name: "Автор заказа",
          value: `<@${authorId}>`,
          inline: true
        },
        ...statusFields
      ],
      image: {
        url: imageLink
      }
    };
  }
};