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

class Client {
  sock?: WASocket;
  prefix: string;

  constructor(prefix?: string) {
    this.prefix = prefix || ".";
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

    this.sock = sock;

    // Save creds
    sock?.ev.on("creds.update", saveCreds);

    this.loadEvents();
  }

  stop() {
    this.sock?.ev.removeAllListeners("messages.upsert");
    this.sock?.ev.removeAllListeners("connection.update");
  }

  private loadCmds() {}

  private loadEvents() {
    const sock = this.sock;
    const eventsPath = join(__dirname, "../events");

    // Load events
    readdirSync(eventsPath).forEach((file) => {
      try {
        const eventFilePath = join(eventsPath, file);
        const eventProps: Events = require(eventFilePath);
        if (sock) {
          sock.ev.on(eventProps.name, (args) => eventProps.run(this, args));
          console.log(`  - ${eventProps.name}`);
        } else {
          console.log(`  - ${eventProps.name} (Sock offline)`);
        }
      } catch (err) {
        console.log(`  - ${file} (Error)`);
      }
    });
  }
}

export default Client;
