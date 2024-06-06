import { readdirSync } from "fs";
import { join } from "path";

import Events from "../types/Events";

import { Client } from "./Instance";

type THandlerProps = {
  sock: Client;
};

/**
 * # Handlers
 * ---
 * Class responsible for loading and registering event and command handlers for the bot.
 */
class Handlers {
  private props: THandlerProps;

  constructor(sock: Client) {
    this.props = { sock };
  }

  // Load and register events
  loadEvents = () => {
    const sock = this.props.sock;
    const eventsPath = join(__dirname, "../events");
    readdirSync(eventsPath).forEach((file) => {
      try {
        const eventFilePath = join(eventsPath, file);
        const eventProps: Events = require(eventFilePath);

        sock.ev.on(eventProps.name, (args) => eventProps.run(sock, args));
        console.log(`    |-${eventProps.name}`);
      } catch (err) {
        console.log(`    |-Error: ${file}`);
      }
    });
  };
}

export default Handlers;
