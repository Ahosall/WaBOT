import Client from "./utils/Instance";

const Main = async () => {
  const client = new Client();

  client.start();

  process.on("uncaughtException", function (exception) {
    console.log(exception);
  });
};

Main();
