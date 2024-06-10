# WhatsApp BOT

A simple structure for a WhatsApp bot using the [Baileys](https://github.com/WhiskeySockets/Baileys) library from [WhiskeySockets](https://github.com/WhiskeySockets).

## Dependencies

> **Note**
>
> All dependencies are required.

| Dependency              | Version |
| :---------------------- | :------ |
| @whiskeysockets/baileys | 6.7.4   |
| @hapi/boom              | 10.0.1  |
| pino                    | 8.15.0  |
| qrcode-terminal         | 0.12.0  |

## How to Start

Starting the application is simple. Just install the dependencies and run the `start` script found in [`package.json`](./package.json).

## Installing Dependencies

```bash
$ npm install
# or
$ yarn install
# or
$ pnpm install
```

> **Note**
>
> Use `--production` for production.

## Initialization

Initialization consists of two levels: **production** and **development**.

```bash
$ pnpm dev # Development
# or
$ pnpm start # Production
```
