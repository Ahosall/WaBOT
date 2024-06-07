import { MessageUpsertType, WAMessage } from "@whiskeysockets/baileys";

import Events from "../types/Events";
import MessageDispatcher from "../types/Message";

export type TMessageUpsertProps = {
  messages: WAMessage[];
  type: MessageUpsertType;
};

const event: Events = {
  name: "messages.upsert",
  run: async (client, recv: TMessageUpsertProps) => {
    const { messages, type } = recv;

    if (type !== "notify") return;
    if (messages.length === 0) return;

    messages.forEach(async (m) => {
      console.log(JSON.stringify(m, null, 2));
      const message = new MessageDispatcher(client, m);
      // console.log(JSON.stringify(message, null, 2));
    });
  },
};

module.exports = event;
