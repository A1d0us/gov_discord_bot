module.exports = {
  supplyEmbed: (type, faction, size, time, authorId, imageLink, status = null, color = 0xfdda0d) => {
    let statusField = status ? [{
      name: "Статус",
      value: status,
      inline: true
    }] : [];
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
        ...statusField
      ],
      image: {
        url: imageLink
      }
    };
  }
};