import { BaileysEventMap } from "@whiskeysockets/baileys";
import Client from "../utils/Instance";

/**
 * Type definition for an event in the Baileys library.
 */
type Events = {
  /**
   * The name of the event.
   * This should be a key from the BaileysEventMap, which defines all possible events.
   */
  name: keyof BaileysEventMap;

  /**
   * The function to be executed when the event is triggered.
   *
   * @param client - The client instance that interacts with the Baileys library.
   * @param args - The arguments associated with the event, can be of any type.
   * @returns A promise that resolves to void or any value.
   */
  run: (client: Client, args: any) => Promise<void | any>;
};

export default Events;
