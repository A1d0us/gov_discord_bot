const moment = require("moment-timezone");

module.exports = {
  textEmbed: (message, footer = null, color = 0xfdda0d) => {
    let embed =  {
      color: color,
      title: message,
    };
    if (!!footer) {
      embed.footer = {
        text: footer
      };
    }

    return embed;
  }
};