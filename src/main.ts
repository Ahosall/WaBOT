import { Client } from "./client/Client";
import {
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";

require("dotenv").config();

const pkg = require("../package.json");

const Main = async () => {
  const { version } = await fetchLatestBaileysVersion();
  const auth = await useMultiFileAuthState(process.cwd() + "/auth/");
  const logger = pino({ level: "fatal" });

  const client = new Client({
    auth,
    version,
    printQRInTerminal: true,
    browser: [`WABot ${pkg.version}`, "Powered By Ahos", pkg.version],
    logger,
  });

  client.start();

  process.on("uncaughtException", function (exception) {
    console.log(exception);
  });
};

Main();
