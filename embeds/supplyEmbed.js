module.exports = {
  supplyEmbed: (type, faction, size, time, authorId, imageLink) => {
    return {
      title: "Заказ поставки " + type,
      color: 0xffffff,
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
      ],
      image: {
        url: imageLink
      }
    };
  }
};