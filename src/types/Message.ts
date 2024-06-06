import { proto, WAMessage } from "@whiskeysockets/baileys";
import { Client } from "../utils/Instance";

type TMessageDispatcherProps = {
  sock: Client;
  from: proto.IMessageKey;
  // tempora;
};

type TMessageDataToSent = {};

class MessageDispatcher {
  private props: TMessageDispatcherProps;

  constructor(client: Client, m: WAMessage) {
    this.props = {
      sock: client,
      from: m.key,
      // temporary: getTemporaryData(m.message),
    };
  }

  reply(entry: TMessageDataToSent) {
    const { sendMessage } = this.props.sock;

    if (typeof entry === "string") {
      // return sendMessage(this.props.from.remoteJid as string, {});
    } else if (typeof entry === "object") {
    }
  }

  private getTemporaryData() {}
}

export default MessageDispatcher;
