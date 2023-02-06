import { User, TMsgSend, TUser } from "./User";
import { WASocket, WAMessage, proto } from "@adiwajshing/baileys";
import { Group } from "./Group";

type TType =
  | "conversation"
  | "extendedTextMessage"
  | "imageMessage"
  | "videoMessage"
  | "messageContextInfo"
  | "buttonsResponseMessage"
  | "stickerMessage";

export default class Message {
  client!: WASocket;
  content: string;
  from: TUser;
  author: User;
  m: WAMessage;
  media:
    | proto.Message.IImageMessage
    | proto.Message.IVideoMessage
    | proto.Message.IStickerMessage;
  key: proto.IMessageKey;
  messageTimestamp: number | Long | null;
  type: TType;
  mentions: Array<string>;
  quoted: proto.IMessage;

  constructor(opts: { sock: any; msg: WAMessage }) {
    this.type = Object.keys(opts.msg.message)[0] as TType;
    this.content = this.NormalizeContent(opts.msg.message);
    this.from = this.NormalizeTo(opts.msg);
    this.m = opts.msg;
    this.client = opts.sock;
    this.key = this.m.key;
    this.messageTimestamp = this.m.messageTimestamp;

    this.Setup();
  }

  react = (emoji: string) => {
    this.client.sendMessage(this.from.id, {
      react: { text: emoji, key: this.key },
    });
  };

  reply = (msg: TMsgSend) => {
    if (typeof msg == "object") {
      this.client.sendMessage(this.from.id, msg, { quoted: this.m });
    } else if (typeof msg == "string") {
      this.client.sendMessage(this.from.id, { text: msg }, { quoted: this.m });
    }
  };

  private Setup() {
    this.author = new User(this.client, this.from);
  }

  async group() {
    return new Group(await this.client.groupMetadata(this.from.id));
  }

  private NormalizeTo = (to: WAMessage) => {
    const from = to.key.remoteJid;

    if (from?.endsWith("@g.us")) {
      return {
        id: from,
        participant: to.key.participant,
        name: to?.pushName,
        image: null,
      };
    } else if (from?.endsWith("@s.whatsapp.net")) {
      return {
        id: from,
        name: to?.pushName,
        image: null,
      };
    } else {
      return undefined;
    }
  };

  private NormalizeContent = (msg: proto.IMessage) => {
    switch (this.type) {
      case "conversation":
        return msg.conversation;
      case "extendedTextMessage":
        let ctxInf = msg.extendedTextMessage.contextInfo;

        if (ctxInf) {
          let quotedMsg = ctxInf.quotedMessage;
          this.mentions = ctxInf.mentionedJid ? ctxInf.mentionedJid : [];
          if (quotedMsg) {
            this.quoted = quotedMsg;

            let quotedType = Object.keys(quotedMsg)[0];
            if (
              quotedType == "imageMessage" ||
              quotedType == "videoMessage" ||
              quotedType == "stickerMessage"
            )
              this.media = quotedMsg[quotedType];
          }
        }

        return msg.extendedTextMessage.text;
      case "imageMessage":
        this.media = msg.imageMessage;

        return msg.imageMessage.caption;
      case "videoMessage":
        this.media = msg.videoMessage;

        return msg.videoMessage.caption;
      case "messageContextInfo" || "buttonsResponseMessage":
        return msg.buttonsResponseMessage.selectedButtonId;
    }
  };
}
