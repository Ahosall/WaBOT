import { downloadContentFromMessage } from "@whiskeyssockets/baileys";

import ffmpeg from "fluent-ffmpeg";
import { writeFileSync, unlinkSync, readFileSync } from "fs";
import webp from "node-webpmux";

import { Client } from "../../client/Client";
import Message from "../../types/Message";

const insertAttr = async (path) => {
  const img = new webp.Image();

  const json = {
    "sticker-pack-id": process.env.STK_PACK_ID,
    "sticker-pack-name": process.env.STK_PACK_NAME,
    "sticker-pack-publisher": process.env.STK_PACK_PUBLISHER,
    emojis: ["happy"],
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);

  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");

  const exif = Buffer.concat([exifAttr, jsonBuff]);

  exif.writeUIntLE(jsonBuff.length, 14, 4);
  await img.load(path);

  img.exif = exif;

  await img.save(path);
};

const convertImage = async (imgIn: string, imgOut: string) => {
  return await new Promise(async (resolve, reject) => {
    await ffmpeg(imgIn)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        `-vcodec`,
        `libwebp`,
        `-vf`,
        `scale='min(350,iw)':min'(350,ih)':force_original_aspect_ratio=decrease,fps=15, pad=350:350:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
      ])
      .toFormat("webp")
      .save(imgOut);
  }).then(async () => {
    await insertAttr(imgOut);
    const buff = readFileSync(imgOut);

    unlinkSync(imgIn);
    unlinkSync(imgOut);

    return buff;
  });
};

const convertVideo = async (videoIn: string, videoOut: string) => {
  return await new Promise(async (resolve, reject) => {
    ffmpeg(videoIn)
      .inputFormat("mp4")
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "scale='min(900,iw)':min'(900,ih)':force_original_aspect_ratio=decrease,fps=15, pad=0:0:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
        "-loop",
        "0",
        "-ss",
        "00:00:00",
        "-t",
        "00:00:05",
        "-preset",
        "default",
        "-an",
        "-vsync",
        "0",
      ])
      .toFormat("webp")
      .save(videoOut);
  }).then(async () => {
    await insertAttr(videoOut);
    const buff = readFileSync(videoOut);

    unlinkSync(videoIn);
    unlinkSync(videoOut);

    return buff;
  });
};

module.exports = {
  info: {
    name: "sticker",
    alias: ["stk", "figurinha"],
    description: "Cria um sticker a partir de uma imagem/vídeo.",
  },
  run: async (client: Client, message: Message, args: Array<string>) => {
    if (message.type == "conversation")
      return message.reply(
        "Erro: Imagem/vídeo náo encontrado.\n\nAo enviar a imagem/vídeo escreva o comando na legenda ou marque a mensagem com o comando."
      );

    let buffer = Buffer.from([]);

    const sticker = `${Math.floor(Math.random() * 50 * 1000)}`;
    const pathVIn = `./temp/${sticker}.mp4`;
    const pathIIn = `./temp/${sticker}.jpeg`;
    const pathOut = `./temp/${sticker}.webp`;

    if (message.media.mimetype.split("/")[0] == "image") {
      const media = await downloadContentFromMessage(message.media, "image");

      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      writeFileSync(pathIIn, buffer);
      const buff = await convertImage(pathIIn, pathOut);

      message.reply({ sticker: buff });
    } else if (message.media.mimetype.split("/")[0] == "video") {
      const media = await downloadContentFromMessage(message.media, "video");

      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      writeFileSync(pathVIn, buffer);
      const buff = await convertVideo(pathVIn, pathOut);

      message.reply({ sticker: buff });
    }
  },
};
