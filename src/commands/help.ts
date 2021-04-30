import { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import { TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import Constants from '../util/constants';
import sendmessage from '../util/sendmessage';

type PageName = 'DEFAULT' | 'ROLES' | 'ADMIN' | 'MOD' | 'HELPER' | 'BASE';

export default class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'about', 'commands'],
      args: [
        {
          id: 'page',
          type: 'uppercase',
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const pages = Constants.HelpPages;

    const page: PageName = args.page ? args.page : 'DEFAULT';

    if (!pages[page]) {
      sendmessage(<TextChannel> message.channel, 'Unknown page!');
      return;
    }

    // eslint-disable-next-line max-len
    let content = `**First Come, First Serve**\n*Default prefix:* \`fcfs!\`\n\n${pages[page].trim().split('\n').map((line) => line.trim()).join('\n')}`;
    if (page === 'DEFAULT') {
      content += `\n\n\`v${(<FCFSClient> this.client).version} by perilstar with help from StKWarrior\``;
    }

    let { dmChannel } = message.author;

    if (!dmChannel) {
      dmChannel = await message.author.createDM();
    }

    if (message.channel instanceof TextChannel) {
      sendmessage(message.channel, 'Sending you a DM with the help message!');
    }
    sendmessage(dmChannel, content);
  }
}
