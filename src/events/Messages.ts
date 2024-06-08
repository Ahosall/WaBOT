import { BaileysEventMap } from "@whiskeysockets/baileys";

import Events from "../types/Events";

const event: Events = {
  name: "messages.upsert",
  run: async (client, recv: BaileysEventMap["messages.upsert"]) => {
    const { messages, type } = recv;

    if (type !== "notify") return;
    if (messages.length === 0) return;

    messages.forEach(async (m) => {
      console.log(JSON.stringify(m, null, 2));
      // const message = new MessageDispatcher(client, m);
    });
  },
};

module.exports = event;
