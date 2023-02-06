import { Boom } from "@hapi/boom";
import { ConnectionState, DisconnectReason } from "@adiwajshing/baileys";
import { unlinkSync, readdirSync } from "fs";
import { join } from "path";

import { Event } from "../types/Event";
import { Client } from "../client/Client";

export = class extends Event {
  constructor(client: Client) {
    super(client, {
      name: "connection.update",
    });
  }

  run = async (update: Partial<ConnectionState>) => {
    const { connection, lastDisconnect } = update;
    const reset = () =>
      setTimeout(async () => await this.client.start(), 5 * 1000);

    const filesAuth = join(process.cwd(), "auth/");

    // Delete session file
    const sessionRemove = async () =>
      await readdirSync(filesAuth).forEach(async (file) =>
        (await file.endsWith(".json"))
          ? unlinkSync(join(filesAuth, file))
          : null
      );

    if (connection == "close") {
      const { statusCode } = (lastDisconnect.error as Boom)?.output;

      if (statusCode === DisconnectReason.badSession) {
        try {
          console.log(`Bad session file, run again...`);
          this.client.sock.logout();

          await sessionRemove(); // Delete session file
        } catch (err) {
          process.exit(1);
        }
      } else if (statusCode === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        reset();
      } else if (statusCode === DisconnectReason.connectionLost) {
        console.log("Connection lost, reconnecting....");
        reset();
      } else if (statusCode === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection Replaced, Another New Session Opened, Please Close Current Session First"
        );
      } else if (statusCode === DisconnectReason.loggedOut) {
        console.log(
          `Device Logged Out, deleting session files and stop process...`
        );
        await sessionRemove();
        process.exit();
      } else if (statusCode === DisconnectReason.restartRequired) {
        console.log("Restart required, restarting...");
        reset();
      } else if (statusCode === DisconnectReason.timedOut) {
        console.log("Connection timedOut, reconnecting...");
        reset();
      } else {
        console.log(lastDisconnect.error);
        reset();
      }
    } else if (connection == "open") {
      console.log(
        `\nLogged on ${this.client.sock.user.name} (${this.client.sock.user.id}).\n`
      );
    }
  };
};
