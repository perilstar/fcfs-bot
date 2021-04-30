import { Command } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import sendmessage from '../util/sendmessage';

export default class MakePancakesCommand extends Command {
  constructor() {
    super('makepancakes', {
      aliases: ['makepancakes', 'pancakes'],
      quoted: true,
      channel: 'dm',
    });
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async exec(message: Message, _args: any) {
    sendmessage(<TextChannel> message.channel, '🥞');
  }
}
