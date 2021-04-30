import { Command } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import sendmessage from '../util/sendmessage';

export default class VersionCommand extends Command {
  constructor() {
    super('version', {
      aliases: ['version', 'v'],
    });
  }

  // eslint-disable-next-line no-unused-vars
  async exec(message: Message, _args: any) {
    const client = <FCFSClient> this.client;
    sendmessage(<TextChannel> message.channel, `v${client.version}`);
  }
}
