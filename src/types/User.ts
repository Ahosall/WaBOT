import { WAMessage } from "@whiskeysockets/baileys";

/**
 * Type definition for user properties.
 */
type TUserProps = {
  id: string;
  name: string | undefined | null;
};

/**
 * Represents a user and provides methods to access user information.
 */
class User {
  private props: TUserProps;

  /**
   * Creates an instance of the User class.
   *
   * @param message - The message object from which to extract user information.
   */
  constructor(message: WAMessage) {
    this.props = {
      id: message.key.remoteJid?.includes("g.us")
        ? (message.key.participant as string)
        : (message.key.remoteJid as string),
      name: message.pushName,
    };
  }

  /**
   * Gets the ID of the user.
   *
   * @returns The user ID.
   */
  get id() {
    return this.props.id;
  }

  /**
   * Gets the name of the user.
   *
   * @returns The user name, which can be undefined or null.
   */
  get name() {
    return this.props.name;
  }
}

export default User;
