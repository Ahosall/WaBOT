import { proto, AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import { Client } from "../utils/Instance";

type TMessageDispatcherProps = {
  sock: Client;
  from: proto.IMessageKey;
  // tempora;
};

type TMessageDataToSent = string | AnyMessageContent;

class MessageDispatcher {
  private props: TMessageDispatcherProps;

  constructor(client: Client, m: WAMessage) {
    this.props = {
      sock: client,
      from: m.key,
      // temporary: getTemporaryData(m.message),
    };
  }

  send(entry: TMessageDataToSent) {
    const { sendMessage } = this.props.sock;

    try {
      if (typeof entry === "string") {
        return sendMessage(this.props.from.remoteJid as string, {
          text: entry,
        });
      } else if (typeof entry === "object") {
        return sendMessage(this.props.from.remoteJid as string, entry);
      } else {
        throw "Input type does not match with TMessageDataToSent";
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private getTemporaryData() {}
}

export default MessageDispatcher;
