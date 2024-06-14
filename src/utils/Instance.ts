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
import Command from "../types/Commands";

class Client {
  sock?: WASocket;
  prefix: string;
  commands: Map<string, Command> = new Map();
  aliases: Map<string, Command> = new Map();

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
    this.loadCmds();
  }

  stop() {
    this.sock?.ev.removeAllListeners("messages.upsert");
    this.sock?.ev.removeAllListeners("connection.update");
  }

  private loadCmds() {
    const commandsPath = join(__dirname, "../commands");

    // Load commands
    console.log("\nCommands:");
    readdirSync(commandsPath).forEach((file) => {
      try {
        const commandFilePath = join(commandsPath, file);
        const commandProps = require(commandFilePath) as Command;
        const commandInfo = commandProps.info;

        if (commandInfo.aliases)
          commandInfo.aliases.forEach((alias) =>
            this.aliases.set(alias, commandProps)
          );

        this.commands.set(commandInfo.name, commandProps);
      } catch (err) {
        console.log(`  - ${file} (Error)`);
      }
    });
  }

  private loadEvents() {
    const sock = this.sock;
    const eventsPath = join(__dirname, "../events");

    // Load events
    console.log("Events:");
    readdirSync(eventsPath).forEach((file) => {
      try {
        const eventFilePath = join(eventsPath, file);
        const eventProps: Events = require(eventFilePath).default;
        if (sock) {
          sock.ev.on(eventProps.name, (args) => eventProps.run(this, args));
          console.log(`  - ${eventProps.name}`);
        } else {
          console.log(`  - ${eventProps.name} (Sock offline)`);
        }
      } catch (err) {
        console.log(`  - ${file} (${err})`);
      }
    });
  }
}

export default Client;
