import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';
import { TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';

export default class MessageDeleteListener extends Listener {
  constructor() {
    super('messageDelete', {
      emitter: 'client',
      event: 'messageDelete',
    });
  }

  async exec(message: Message) {
    const client = <FCFSClient> this.client;

    const { channel } = message;
    if (!(channel instanceof TextChannel)) return;

    const ds = client.dataSource;

    const server = ds.servers[channel.guild.id];

    Object.keys(server.channelMonitors).forEach((snowflake) => {
      if (server.channelMonitors[snowflake].displayMessage === message.id) {
        ds.removeMonitor(server.id, snowflake);
      }
    });
  }
}
