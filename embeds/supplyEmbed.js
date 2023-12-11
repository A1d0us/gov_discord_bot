const {SupplyStatus} = require("../constants/SupplyStatus");
module.exports = {
  supplyEmbed: (supply, color = 0xfdda0d, reason = null) => {
    let statusFields = supply.status !== SupplyStatus.CREATED ? [
      {
        name: "Статус",
        value: supply.status,
        inline: true
      },
      {
        name: "Сотрудник GOV",
        value: supply.reviewer_id ? `<@${supply.reviewer_id}>` : '-',
        inline: true,
      },
    ] : [];
    if (supply.status === SupplyStatus.REJECTED) {
      statusFields = [...statusFields, {
        name: "Причина отказа",
        value: reason,
        inline: true
      }]
    }
    return {
      title: "Заказ поставки " + supply.type,
      color: color,
      fields: [
        {
          name: "Номер",
          value: supply.id,
          inline: true
        },
        {
          name: "Фракция",
          value: supply.faction,
          inline: true
        },
        {
          name: "Размер",
          value: supply.size,
          inline: true
        },
        {
          name: "Время заказа",
          value: supply.time.slice(0, 5),
          inline: true
        },
        {
          name: "Автор заказа",
          value: `<@${supply.author_id}>`,
          inline: true
        },
        ...statusFields
      ],
      image: {
        url: supply.screenshot_url
      }
    };
  }
};