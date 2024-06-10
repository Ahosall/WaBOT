import Command from "../types/Commands";

const cmd: Command = {
  info: {
    name: "ping",
    description: "Verifica a latencia das APIs do bot.",
    aliases: ["p"],
  },
  run: async (client, message, args) => {
    message.reply("Salve");
  },
};

module.exports = cmd;
