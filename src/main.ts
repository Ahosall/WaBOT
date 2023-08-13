import { Client } from "./client/Client";
import {
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeyssockets/baileys";
import pino from "pino";

require("dotenv").config();

const Main = async () => {
  const botVersion = require("../package.json").version;
  const { version } = await fetchLatestBaileysVersion();
  const auth = await useMultiFileAuthState(process.cwd() + "/auth/");

  const client = new Client({
    auth,
    version,
    printQRInTerminal: true,
    browser: [`WABot ${botVersion}`, "Powered By Ahos", botVersion],
    logger: pino({ level: "silent" }),
  });

  client.start();

  process.on("uncaughtException", function (exception) {
    console.log(exception);
  });
};

Main();
