import { readdirSync } from "fs";
import makeWASocket, {
  makeCacheableSignalKeyStore,
  WASocket,
} from "@whiskeysockets/baileys";

type TCommands = {
  info: {
    name: string;
    alias: Array<string>;
    category?: string;
    description: string;
  };
  run: () => void;
};

export class Client {
  sock: WASocket;
  options: any;
  commands: {} | TCommands = {};
  aliases: {} | TCommands = {};
  cooldown: {} = {};
  prefix: string = (process.env.PREFIX as string) || "!";

  constructor(opts: object) {
    this.options = opts;
  }

  async start() {
    console.clear();
    this.sock = makeWASocket({
      ...this.options,
      auth: {
        creds: this.options.auth.state.creds,
        keys: await makeCacheableSignalKeyStore(
          this.options.auth.state.keys,
          this.options.logger
        ),
      },
    });

    this.loadEvent();
    this.loadCmds();
  }

  loadCmds() {
    const cmdsPath = "src/commands";

    console.log("\nLoading commands...");
    readdirSync(cmdsPath).forEach((category) => {
      const cgrPath = `${process.cwd()}/${cmdsPath}/${category}`;
      const commands = readdirSync(cgrPath).filter((f) => f.endsWith(".ts"));

      commands.forEach((cmdFile) => {
        const cmd: TCommands = require(`${cgrPath}/${cmdFile}`);

        if (Object.keys(this.commands).includes(cmd.info.name) == false) {
          cmd.info.category = category;
          this.commands = { ...this.commands, [cmd.info.name]: cmd };
          if (cmd.info.alias != undefined && cmd.info.alias.length > 0)
            cmd.info.alias.map(
              (a) => (this.aliases = { ...this.aliases, [a]: cmd })
            );
        }

        console.log("- ", cmd.info.name, `(${category})`, "OK");
      });
    });
  }

  loadEvent() {
    const localPath: string = "src/controllers";
    console.log("Loading events...");

    this.sock.ev.on("creds.update", this.options.auth.saveCreds);
    readdirSync(localPath).forEach((file) => {
      const eventClass = require(`${process.cwd()}/${localPath}/${file}`);
      const newEvent = new eventClass(this);
      console.log(`  - ${newEvent.name}`);
      this.sock.ev.on(newEvent.name, newEvent.run);
    });
  }
}
