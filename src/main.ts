import Client from "./utils/Instance";

import Config from "./utils/Config";

const Main = async () => {
  const client = new Client(Config.prefix);

  client.start();

  process.on("uncaughtException", function (exception) {
    console.log(exception);
  });
};

Main();
