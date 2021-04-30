import { Listener } from 'discord-akairo';
import type { TextChannel, Message } from 'discord.js';
import sendmessage from '../util/sendmessage';

export default class MissingPermissionsListener extends Listener {
  constructor() {
    super('missingPermissions', {
      emitter: 'commandHandler',
      event: 'missingPermissions',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  exec(message: Message, _command: any, type: string, missing: string) {
    if (missing === 'botAdmin') {
      sendmessage(<TextChannel> message.channel, 'Missing permissions to do this! Are you a bot admin?');
      return;
    }
    if (missing === 'botMod') {
      sendmessage(<TextChannel> message.channel, 'Missing permissions to do this! Are you a bot mod or higher?');
      return;
    }
    if (missing === 'botHelper') {
      sendmessage(<TextChannel> message.channel, 'Missing permissions to do this! Are you a bot helper or higher?');
      return;
    }
    if (type === 'user') {
      sendmessage(<TextChannel> message.channel, 'Missing permissions to do this! Are you an Administrator?');
      return;
    }
    if (type === 'unknown') {
      sendmessage(<TextChannel> message.channel, 'An unknown error occurred sorting out permissions for this command!');
    }
  }
}
