import { Client } from "../../client/Client";
import Message from "../../types/Message";

import openAI from "../../services/openai";

const messages = [];
const defaults = [
  "IA: Eu sou a Ayee.",
  "IA: Fui criada por Ahosall.",
  "IA: Ahosall é um jovem desenvolvedor de 17 anos, e é dono do seguinte perfil do github: https://github.com/ahosall",
];

const chatgpt = async (author: string, entry: string) => {
  messages.push({ author, content: entry });

  return await openAI
    .createCompletion({
      model: "text-davinci-003",
      prompt: [
        defaults.join("\n"),
        messages.map((e) => `${e.author}: ${e.content}\nIA:`).join("\n"),
      ].join(" "),
      temperature: 0.9,
      max_tokens: 1024,
    })
    .then((res) => {
      const choices = res.data.choices;
      const selected = choices[0].text
        .replace("\n", "")
        .replace("\n", "")
        .replace("IA: ", "")
        .replace("  ", "");

      const threat = selected.replace(" ", "") !== "" ? selected : "Não sei...";
      messages.push({ author: "IA", content: threat });
      return threat;
    });
};

module.exports = {
  info: {
    name: "ai",
    alias: ["bot", "gpt", "ia"],
    description: "Faça uma pergunta para a inteligencia artifical",
  },
  run: async (client: Client, message: Message, args: Array<string>) => {
    if (args.length < 1) return;
    const res = await chatgpt(message.author.name, args.join(" "));

    message.reply(res);
  },
};
