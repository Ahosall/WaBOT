import { BaileysEventMap } from "@whiskeysockets/baileys";

import Events from "../types/Events";
import MessageDispatcher from "../types/Message";

const event: Events = {
  name: "messages.upsert",
  run: async (client, recv: BaileysEventMap["messages.upsert"]) => {
    const { messages, type } = recv;

    if (type !== "notify") return;
    if (messages.length === 0) return;

    messages.forEach(async (m) => {
      const message = new MessageDispatcher(client, m);

      if (message.from === "status@broadcast") return;
      if (message.content === null) return;
      if (!message.content?.startsWith(client.prefix)) return;

      const body = message.content.slice(client.prefix.length).split(" ");

      const cmd = body[0];
      const args = body.slice(1);

      if (!cmd) return;

      const command = client.commands.get(cmd) || client.aliases.get(cmd);
      if (!command) return;

      await command.run(client, message, args);
    });
  },
};

module.exports = event;
