import { WASocket, AnyRegularMessageContent } from "@whiskeyssockets/baileys";

export type TUser = {
  client?: WASocket;
  id: string;
  participant?: string;
  name: string;
  image: Partial<Promise<string>>;
};

export type TMsgSend = string | AnyRegularMessageContent;

export class User {
  private props: TUser;

  constructor(client: WASocket, user: TUser) {
    this.props = { client, ...user };
  }

  get id(): string {
    return this.props.participant ? this.props.participant : this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  async image(): Promise<string> {
    return await this.props.client.profilePictureUrl(this.id, "image");
  }

  send = (msg: TMsgSend) => {
    switch (typeof msg) {
      case "object":
        this.props.client.sendMessage(this.id, msg);
      case "string":
        this.props.client.sendMessage(this.id, {
          text: msg,
        } as AnyRegularMessageContent);
    }
  };
}
