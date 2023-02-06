import { Client } from "../../client/Client";
import Message from "../../types/Message";

import { readdirSync } from "fs";

module.exports = {
  info: {
    name: "help",
    alias: ["?", "ajuda", "comandos", "cmds"],
    description: "Exibe mensagem todos os comandos do bot.",
  },
  run: (client: Client, message: Message, args: Array<string>) => {
    let commands = client.commands;
    let helpMsg = "*Comandos*";

    if (message.key.id.endsWith("g.us"))
      message.reply("Irei enviar no seu PV...");
    if (args.length > 0) {
      helpMsg += ` - *${args[0].toLowerCase()}*\n\`\`\`\n`;
      Object.keys(commands).forEach((cmd) => {
        let { info } = commands[cmd];
        if (info.category == args[0].toLowerCase()) {
          helpMsg += `  ≈ ${info.name}\n    + ${info.description}\n\n`;
        }
      });
      helpMsg = "\n```";
    } else {
      helpMsg += " - *Categorias*\n```\n";
      readdirSync("./src/commands").forEach((category) => {
        helpMsg += `  ≈ ${category}\n`;
      });

      helpMsg += "\n```\n_Digite help <categoria> para ver os comandos_";
    }

    message.author.send(helpMsg);
  },
};
