import Handlers from "./utils/Handlers";
import createInstance from "./utils/Instance";

const Main = async () => {
  console.clear();
  console.log("Initializing...\n");
  const sock = await createInstance();

  console.log("Loading handlers...");
  const handlers = new Handlers(sock);
  console.log("  -Events");
  handlers.loadEvents();

  process.on("uncaughtException", function (exception) {
    console.log(exception);
  });
};

Main();
