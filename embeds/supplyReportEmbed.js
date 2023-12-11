const {SupplyStatus} = require("../constants/SupplyStatus");
const {SupplyType} = require("../constants/SupplyType");

module.exports = {
  supplyReportEmbed: (supply, successCarsCount, userId) => {
    let result = '';
    let carsCount = supply.type === SupplyType.EMS ? 4 : 10;
    return {
      title: "Итог поставки № " + supply.id,
      color: 0xfdda0d,
      fields: [
        {
          name: "Фракция",
          value: supply.faction,
          inline: true
        },
        {
          name: "Тип",
          value: supply.type,
          inline: true
        },
        {
          name: "Результат",
          value: successCarsCount >= carsCount / 2 ? "Удачно" : "Неудачно",
          inline: true
        },
        {
          name: "Количество матовозок",
          value: successCarsCount + "/" + carsCount,
          inline: true
        },
        {
          name: `Количество доставленных ${supply.type === SupplyType.EMS ? "аптечек" : "материалов"}`,
          value: supply.size / carsCount * successCarsCount,
          inline: true
        },
        {
          name: "Отчёт оставил",
          value: `<@${userId}>`,
          inline: true
        },
      ]
    };
  }
};