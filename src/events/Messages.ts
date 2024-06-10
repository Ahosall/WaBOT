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

      if (message.content === null) return;
      if (!message.content?.startsWith(client.prefix)) return;

      console.log(message.content);
    });
  },
};

module.exports = event;
