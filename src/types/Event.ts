import { Client } from "../client/Client";

export class Event {
  client: Client;
  name: string;

  constructor(client: Client, options: { name: string }) {
    this.client = client;
    this.name = options.name;
  }
}
