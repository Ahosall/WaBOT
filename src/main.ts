import Handlers from "./utils/Handlers";
import startInstance from "./utils/Instance";

const Main = async () => {
  const sock = await startInstance();

  console.log("Loading handlers...");
  const handlers = new Handlers(sock);

  console.log("  -Events");
  handlers.loadEvents();

  process.on("uncaughtException", function (exception) {
    console.log(exception);
  });
};

Main();
