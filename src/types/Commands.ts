import Client from "../utils/Instance";
import MessageDispatcher from "./Message";

/**
 * Type definition for command information.
 */
type TInfoCommand = {
  /**
   * The name of the command.
   */
  name: string;

  /**
   * A brief description of what the command does.
   */
  description: string;

  /**
   * An array of alternative names for the command.
   * It can be undefined if there are no aliases.
   */
  aliases: string[] | undefined;
};

/**
 * Type definition for a command.
 */
type Command = {
  /**
   * Information about the command.
   */
  info: TInfoCommand;

  /**
   * The function to be executed when the command is run.
   *
   * @param client - The client instance that interacts with the Baileys library.
   * @param message - The MessageDispatcher instance containing the message data.
   * @param args - An array of arguments passed to the command.
   * @returns A promise that resolves to void or any value.
   */
  run: (
    client: Client,
    message: MessageDispatcher,
    args: string[]
  ) => Promise<void | any>;
};

export default Command;
