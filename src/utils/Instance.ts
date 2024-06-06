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
    }),
    prefix: ".",
  };

  sock.ev.on("creds.update", saveCreds);

  return sock;
};

export default createInstance;
