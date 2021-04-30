import type { Message, TextChannel } from 'discord.js';

import { Listener } from 'discord-akairo';
import sendmessage from '../util/sendmessage';

export default class CommandBlockedListener extends Listener {
  constructor() {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: 'commandBlocked',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  exec(message: Message, command: any, reason: string) {
    if (reason === 'guild') {
      sendmessage(<TextChannel> message.channel, 'You can only use this command in a guild!');
    }
  }
}
