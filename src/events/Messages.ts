import { BaileysEventMap } from "@whiskeysockets/baileys";

import Events from "../types/Events";
import MessageDispatcher from "../types/Message";

/**
 * Event handler for the "messages.upsert" event.
 */
const event: Events = {
  name: "messages.upsert",

  /**
   * The function to be executed when the "messages.upsert" event is triggered.
   *
   * @param client - The client instance that interacts with the Baileys library.
   * @param recv - The event data containing the messages and the type.
   */
  run: async (client, recv: BaileysEventMap["messages.upsert"]) => {
    const { messages, type } = recv;

    if (type !== "notify") return;
    if (messages.length === 0) return;

    for (const m of messages) {
      if (!m.message) return;

      const groupMetadata = m.key.remoteJid?.endsWith("@g.us")
        ? await client.sock?.groupMetadata(m.key.remoteJid)
        : undefined;

      const message = new MessageDispatcher(client, m, groupMetadata);

      if (message.from === "status@broadcast") return;
      if (message.content === null) return;
      if (!message.content?.startsWith(client.prefix)) return;

      const body = message.content.slice(client.prefix.length).split(" ");
      const cmd = body[0];
      const args = body.slice(1);

      if (!cmd) return;

      const command = client.commands.get(cmd) || client.aliases.get(cmd);
      if (!command) return;

      try {
        await command.run(client, message, args);
      } catch (err) {
        console.error(err);

        client.sock?.sendMessage(message.from as string, {
          react: { text: "❌", key: m.key },
        });
      }
    }
  },
};

export default event;
