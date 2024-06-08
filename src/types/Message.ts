import { proto, AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import { Client } from "../utils/Instance";

type TMessageDispatcherProps = {
  m: WAMessage;
  sock: Client;

  type: keyof proto.IMessage;
  from: proto.IMessageKey;

  media?: proto.Message.IVideoMessage | proto.Message.IImageMessage | null;

  quoted?: proto.IMessage;
  mentions?: string[];

  temporary?: number;
};

type TMessageDataToSent = string | AnyMessageContent;

class MessageDispatcher {
  private props: TMessageDispatcherProps;

  constructor(client: Client, m: WAMessage) {
    this.props = {
      m,
      sock: client,
      from: m.key,
      type: this.getMessageType(),
      temporary: this.getTemporaryData(),
    };
  }

  get content() {
    const msg = this.props.m.message as proto.IMessage;

    switch (this.props.type) {
      case "conversation":
        return msg.conversation;
      case "extendedTextMessage":
        let ctxInf = msg.extendedTextMessage?.contextInfo;

        if (ctxInf) {
          let quotedMsg = ctxInf.quotedMessage;
          this.props.mentions = ctxInf.mentionedJid ? ctxInf.mentionedJid : [];
          if (quotedMsg) {
            this.props.quoted = quotedMsg;

            let quotedType = Object.keys(quotedMsg)[0];
            if (
              quotedType == "imageMessage" ||
              quotedType == "videoMessage" ||
              quotedType == "stickerMessage"
            )
              this.props.media = quotedMsg[quotedType];
          }
        }

        return msg.extendedTextMessage?.text;
      case "imageMessage":
        this.props.media = msg.imageMessage;

        return msg.imageMessage?.caption;
      case "videoMessage":
        this.props.media = msg.videoMessage;

        return msg.videoMessage?.caption;
      // case "messageContextInfo" || "buttonsResponseMessage":
      //   return msg.buttonsResponseMessage?.selectedButtonId;
    }
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

  private getMessageType() {
    return Object.keys(this.props.m).reverse()[0] as keyof proto.IMessage;
  }

  private getTemporaryData() {
    return 0;
  }
}

export default MessageDispatcher;
