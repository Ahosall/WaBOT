import makeWASocket, {
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";

export type Client = WASocket & {
  prefix: string;
};

const createInstance = async () => {
  const projectVersion = require("../../package.json")["version"];

  const { version } = await fetchLatestBaileysVersion();
  const { saveCreds, state } = await useMultiFileAuthState(
    process.cwd() + "/auth/"
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
      printQRInTerminal: true,
      browser: [`WABot ${projectVersion}`, "Powered By Ahos", projectVersion],
    }),
    prefix: ".",
  };

  sock.ev.on("creds.update", saveCreds);

  return sock;
};

export default createInstance;
