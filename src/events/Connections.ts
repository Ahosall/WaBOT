import { Boom } from "@hapi/boom";
import { BaileysEventMap, DisconnectReason } from "@whiskeysockets/baileys";
import Events from "../types/Events";
import { join } from "path";
import { readdirSync, unlinkSync } from "fs";

/**
 * Removes session files.
 */
const sessionRemove = async () => {
  const filesAuth = join(__dirname, "../../auth/");
  readdirSync(filesAuth).forEach((file) => {
    if (file.endsWith(".json")) unlinkSync(join(filesAuth, file));
  });
};

/**
 * Event handler for the "connection.update" event.
 */
const event: Events = {
  name: "connection.update",

  /**
   * The function to be executed when the "connection.update" event is triggered.
   *
   * @param client - The client instance that interacts with the Baileys library.
   * @param recv - The event data containing the connection status and the last disconnection details.
   */
  run: async (client, recv: BaileysEventMap["connection.update"]) => {
    const { connection, lastDisconnect } = recv;

    /**
     * Restarts the client after a delay.
     */
    const restart = async () => {
      await setTimeout(async () => {
        await client.stop();
        await client.start();
      }, 5000);
    };

    if (connection === "close" && lastDisconnect) {
      const { statusCode } = (lastDisconnect.error as Boom)?.output;

      switch (statusCode) {
        case DisconnectReason.badSession:
          try {
            console.log("Bad session file, run again...");
            client.sock?.logout();
            await sessionRemove();
          } catch (err) {
            process.exit(1);
          }
          break;
        case DisconnectReason.connectionClosed:
          console.log("Connection closed....");
          process.exit(1);
        case DisconnectReason.connectionLost:
          console.log("Connection lost....");
          await restart();
          break;
        case DisconnectReason.connectionReplaced:
          console.log(
            "There is one active instance, closing the current one..."
          );
          process.exit(1);
        case DisconnectReason.loggedOut:
          console.log(
            "Device Logged Out, deleting session files and stopping process..."
          );
          await sessionRemove();
          process.exit(0);
        case DisconnectReason.restartRequired:
          console.log("Restart required! Restarting...");
          await restart();
          break;
        case DisconnectReason.timedOut:
          console.log("Connection Timed Out... restarting....");
          await restart();
          break;
        default:
          console.log(lastDisconnect.error);
          await restart();
          break;
      }
    } else if (connection === "open") {
      const user = client.sock?.user;
      console.log(`\nLogged on ${user?.name} (${user?.id}).\n`);
    }
  },
};

export default event;
