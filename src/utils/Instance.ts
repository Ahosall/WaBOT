import makeWASocket, {
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";

import { join } from "path";
import Events from "../types/Events";
import { readdirSync } from "fs";

export type TClientCustomProps = {
  prefix: string;
};

type TClientProps = {
  sock?: WASocket;
  prefix: string;
};
class Client {
  private props: TClientProps;

  constructor(prefix: string = ".") {
    this.props = { prefix };
  }

  async start() {
    console.clear();
    console.log("Initializing...\n");

    const projectVersion = require("../../package.json")["version"];

    const { version } = await fetchLatestBaileysVersion();
    const { saveCreds, state } = await useMultiFileAuthState(
      join(__dirname, "../../auth/")
    );

    const logger = pino({ level: "silent" });

    const auth = {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    };

    const sock = makeWASocket({
      auth,
      logger,
      version,
      syncFullHistory: false,
      printQRInTerminal: true,
      browser: [`WABot ${projectVersion}`, "Powered By Ahos", projectVersion],
    });

    this.props.sock = sock;

    // Save creds
    sock?.ev.on("creds.update", saveCreds);

    this.loadEvents();
  }

  private loadEvents() {
    const sock = this.props.sock;
    const eventsPath = join(__dirname, "../events");

    // Load events
    readdirSync(eventsPath).forEach((file) => {
      try {
        const eventFilePath = join(eventsPath, file);
        const eventProps: Events = require(eventFilePath);

        sock?.ev.on(eventProps.name, (args) => eventProps.run(sock, args));
        console.log(`  - ${eventProps.name}`);
      } catch (err) {
        console.log(`  - ${file} (Error)`);
      }
    });
  }
}

export default Client;
