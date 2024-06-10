import { BaileysEventMap } from "@whiskeysockets/baileys";
import Client from "../utils/Instance";

type Events = {
  name: keyof BaileysEventMap;
  run: (client: Client, args: any) => Promise<void | any>;
};

export default Events;
