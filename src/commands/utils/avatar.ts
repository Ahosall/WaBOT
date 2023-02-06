import { Client } from "../../client/Client";
import Message from "../../types/Message";

module.exports = {
  info: {
    name: "avatar",
    alias: ["useravatar"],
    description: "Envia a sua foto de perfil ou de uma pessoa.",
  },
  run: async (client: Client, message: Message, args: Array<string>) => {
    var uri, user;
    if (args.length > 0) {
      const { members, admins } = await message.group();
      try {
        uri = await client.sock.profilePictureUrl(message.mentions[0], "image");
      } catch (err) {
        uri =
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
      }

      user = [...members, ...admins].filter((m) => m == message.mentions[0])[0];
    } else {
      uri = await message.author.image();
      user = message.author.id;
    }

    message.reply({
      image: {
        url: uri,
      },
      caption: `Foto de perfil de ${
        args.length > 0 ? args[0] : `@${user.split("@")[0]}`
      }`,
      mentions: [user],
    });
  },
};
