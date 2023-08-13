import { WASocket, WAProto, WAMessage, proto } from "@whiskeyssockets/baileys";
import { Client } from "../client/Client";
import { Event } from "../types/Event";
import Message from "../types/Message";

const cooldown = {};

type TMessageUpsert = {
  messages: Array<WAMessage>;
  type: "append" | "notify";
};

export = class extends Event {
  constructor(client: Client) {
    super(client, {
      name: "messages.upsert",
    });
  }

  run = async ({ messages, type }: TMessageUpsert) => {
    const msg = messages[0];
    const from = msg.key.remoteJid;

    const sock: WASocket = this.client.sock;
    const commands = this.client.commands;
    const aliases = this.client.aliases;
    const prefix = this.client.prefix;

    const notPermission =
      // msg.key.fromMe ||
      type != "notify" || from == "status@broadcast";

    if (notPermission) return;

    try {
      const message = new Message({ sock, msg });
      const userCooldown = cooldown[message.author.id];

      if (
        message.content == null ||
        message.content.replace(" ", "") == "" ||
        !message.content.startsWith(prefix)
      )
        return;

      if (Date.now() < userCooldown) return;
      else cooldown[message.author.id] = Date.now() + 10 * 1000;

      let args = message.content.replace(prefix, "").trim().split(/ +/g);

      const command = args.shift().toLowerCase();
      let cmd = commands[command] || aliases[command];

      if (!cmd)
        return message.reply(
          `Erro: Não reconheço o comando: *${command}*.\n\n Digite \`\`\`${prefix}cmds\`\`\` para consultar todos os comandos`
        );

      console.log(
        `${message.author.name ? message.author.name : message.author.id} run ${
          cmd.info.name
        } ${args.join(" ")} in ${from.endsWith("@g.us") ? "group" : "dm"}!`
      );

      await cmd.run(this.client, message, args);
      message.react("👍");
    } catch (err) {
      this.client.sock.sendMessage(from, {
        react: { text: "❌", key: msg.key },
      });
    }
  };
};
