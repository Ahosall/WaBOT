import makeWASocket, {
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";

import { join } from "path";
import Handlers from "./Handlers";

export type Client = WASocket & {
  prefix: string;
};

const startInstance = async () => {
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

  const sock: Client = {
    ...makeWASocket({
      auth,
      logger,
      version,
      syncFullHistory: false,
      printQRInTerminal: true,
      browser: [`WABot ${projectVersion}`, "Powered By Ahos", projectVersion],
    }),
    prefix: ".",
  };

  // Save auth file
  sock.ev.on("creds.update", saveCreds);

  return sock;
};

export default startInstance;
