import {
  proto,
  AnyMessageContent,
  WAMessage,
  WASocket,
} from "@whiskeysockets/baileys";

import Client from "../utils/Instance";
import Group from "./Group";
import User from "./User";

/**
 * Type definition for message properties.
 */
type TMessageDispatcherProps = {
  m: WAMessage;
  sock: WASocket;

  type: keyof proto.IMessage;
  from: proto.IMessageKey;

  media?: proto.Message.IVideoMessage | proto.Message.IImageMessage | null;

  quoted?: proto.IMessage;
  mentions?: string[];

  temporary?: number;
};

type CustomAnyMessageContent = {
  text: string;
  mentions: string[];
} & AnyMessageContent;

type TMessageDataToSent = string | CustomAnyMessageContent;

/**
 * Class responsible for dispatching messages.
 */
class MessageDispatcher {
  private props: TMessageDispatcherProps;

  /**
   * Constructor for MessageDispatcher.
   *
   * @param client - The client instance.
   * @param m - The WAMessage instance.
   */
  constructor(client: Client, m: WAMessage) {
    this.props = {
      m,
      sock: client.sock as WASocket,
      from: m.key,
      type: Object.keys(
        m.message as proto.IMessage
      ).reverse()[0] as keyof proto.IMessage,
      temporary: this.getTemporaryData(),
    };
  }

  /**
   * Gets the remoteJID of the message author.
   *
   * @return The remoteJID.
   */
  get from() {
    if (this.fromGroup) return this.props.from.participant;
    return this.props.from.remoteJid;
  }

  /**
   * Gets whether the message was sent in a group or not.
   *
   * @return True if the message was sent in a group, false otherwise.
   */
  get fromGroup() {
    const remoteJid = this.props.from.remoteJid as string;
    return remoteJid.includes("@g.us");
  }

  /**
   * Asynchronously fetches the group metadata and returns a Group instance.
   *
   * @returns A promise that resolves to a Group instance if successful, or undefined if there was an error.
   */
  get group() {
    return this.props.sock
      .groupMetadata(this.props.from.remoteJid as string)
      .then((data) => new Group(data))
      .catch((err) => {
        console.error(err);
        return undefined;
      });
  }

  /**
   * Gets the author of the message and returns a User instance.
   *
   * @returns An instance of the User class representing the author of the message.
   */
  get author() {
    return new User(this.props.m);
  }

  /**
   * Getter for the content of the message.
   *
   * @returns The content of the message.
   */
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
      default:
        return null;
    }
  }

  /**
   * Sends a message.
   *
   * @param entry - The message content to be sent, either as a string or an object of AnyMessageContent type.
   * @returns The result of the sendMessage function call or null if an error occurs.
   */
  send(entry: TMessageDataToSent) {
    const { sendMessage } = this.props.sock;
    const remoteJid = this.props.from.remoteJid as string;

    try {
      if (typeof entry === "string") {
        const { cleanedText, mentions } = this.processMentions(entry);

        const messageContent: AnyMessageContent = {
          text: cleanedText,
          ...(mentions.length > 0 && { mentions }),
        };

        return sendMessage(remoteJid, messageContent);
      } else if (typeof entry === "object") {
        const messageContent = { ...entry };

        if (messageContent.text) {
          const { cleanedText, mentions } = this.processMentions(
            messageContent.text
          );
          messageContent.text = cleanedText;
          messageContent.mentions =
            mentions.length > 0 ? mentions : messageContent.mentions;
        }

        return sendMessage(remoteJid, messageContent);
      } else {
        throw new Error("Input type does not match with TMessageDataToSent");
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Replies to a message.
   *
   * @param entry - The message content to be sent, either as a string or an object of AnyMessageContent type.
   * @returns The result of the sendMessage function call or null if an error occurs.
   */
  reply(entry: TMessageDataToSent) {
    const { sendMessage } = this.props.sock;
    const remoteJid = this.props.from.remoteJid as string;

    try {
      if (typeof entry === "string") {
        const { cleanedText, mentions } = this.processMentions(entry);

        const messageContent: AnyMessageContent = {
          text: cleanedText,
          ...(mentions.length > 0 && { mentions }),
        };

        return sendMessage(remoteJid, messageContent, {
          quoted: this.props.m,
        });
      } else if (typeof entry === "object") {
        const messageContent = { ...entry };

        if (messageContent.text) {
          const { cleanedText, mentions } = this.processMentions(
            messageContent.text
          );
          messageContent.text = cleanedText;
          messageContent.mentions =
            mentions.length > 0 ? mentions : messageContent.mentions;
        }

        return sendMessage(remoteJid, messageContent, {
          quoted: this.props.m,
        });
      } else {
        throw new Error("Input type does not match with TMessageDataToSent");
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Retrieves temporary data.
   *
   * @returns The temporary data as a number.
   */
  private getTemporaryData() {
    return 0;
  }

  /**
   * Processes mentions in a text string.
   *
   * @param text The text to process for mentions.
   * @returns An array of mention strings formatted as `number@s.whatsapp.net`.
   */
  private processMentions(text: string) {
    const mentionMatches = text.match(/@\d+@s\.whatsapp\.net|@\d+/g);
    let cleanedText = text;
    let mentions: string[] = [];

    if (mentionMatches) {
      mentions = mentionMatches.map((mention) => {
        let number = mention.replace("@s.whatsapp.net", "");
        cleanedText = cleanedText.replace(mention, number);
        return `${number.replace("@", "")}@s.whatsapp.net`;
      });
    }

    return { cleanedText, mentions };
  }
}

export default MessageDispatcher;
