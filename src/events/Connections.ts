import { Boom } from "@hapi/boom";
import { BaileysEventMap, DisconnectReason } from "@whiskeysockets/baileys";

import Events from "../types/Events";
import { join } from "path";
import { readdirSync, unlinkSync } from "fs";

import startInstance from "../utils/Instance";

const sessionRemove = async () => {
  const filesAuth = join(__dirname, "../../auth/");
  readdirSync(filesAuth).forEach((file) => {
    if (file.endsWith(".json")) unlinkSync(join(filesAuth, file));
  });
};

const event: Events = {
  name: "connection.update",
  run: async (client, recv: BaileysEventMap["connection.update"]) => {
    const { connection, lastDisconnect } = recv;

    if (connection == "close" && lastDisconnect) {
      const { statusCode } = (lastDisconnect.error as Boom)?.output;

      switch (statusCode) {
        case DisconnectReason.badSession:
          try {
            console.log(`Bad session file, run again...`);
            client.logout();

            await sessionRemove();
          } catch (err) {
            process.exit(1);
          }
        case DisconnectReason.connectionClosed:
          console.log("Connection closed....");
          process.exit(1);
        case DisconnectReason.connectionLost:
          console.log("Connection lost....");
          process.exit(1);
        case DisconnectReason.connectionReplaced:
          console.log(
            "Connection Replaced, Another New Session Opened, Close Current Session"
          );
          process.exit(1);
        case DisconnectReason.loggedOut:
          console.log(
            `Device Logged Out, deleting session files and stop process...`
          );
          await sessionRemove();
          process.exit(0);
        case DisconnectReason.restartRequired:
          console.log("Restart required...");
          process.exit();
        case DisconnectReason.timedOut:
          console.log("Connection timedOut...");
          process.exit(1);
        default:
          console.log(lastDisconnect.error);
          process.exit(1);
      }
    } else if (connection == "open") {
      const user = client.user;
      if (user?.name == undefined) {
        process.exit(1);
      } else {
        console.log(`\nLogged on ${user?.name} (${user?.id}).\n`);
      }
    }
  },
};

module.exports = event;
