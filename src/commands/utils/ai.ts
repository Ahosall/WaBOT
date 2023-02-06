import { Client } from "../../client/Client";
import Message from "../../types/Message";

import openAI from "../../services/openai";

module.exports = {
  info: {
    name: "ai",
    alias: ["bot", "gpt", "ia"],
    description: "Faça uma pergunta para a inteligencia artifical",
  },
  run: async (client: Client, message: Message, args: Array<string>) => {
    openAI
      .createCompletion({
        model: "text-davinci-003",
        prompt: args.join(" "),
        temperature: 0.9,
        max_tokens: 1024,
      })
      .then((res) => {
        const choices = res.data.choices;
        const selected = choices[Math.floor(Math.random() * choices.length)];
        const threat = selected.text.replace("\n", "").replace("\n", " ");

        message.reply(threat);
      });
  },
};
