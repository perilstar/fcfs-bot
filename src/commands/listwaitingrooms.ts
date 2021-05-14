import { Command } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import mpsAdmin from '../util/mps_admin';
import sendmessage from '../util/sendmessage';

export default class ListWaitingRoomsCommand extends Command {
  constructor() {
    super('listwaitingrooms', {
      aliases: ['listwaitingrooms', 'lwr'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsAdmin(<FCFSClient> this.client, message),
      args: [
        {
          id: 'page',
          type: 'integer',
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;

    const page = args.page ?? 1;

    const ds = client.dataSource;
    const server = ds.servers[message.guild!.id];

    const { channelMonitors } = server;

    const monitoredNames: Array<string> = [];
    const displayNames: Array<string> = [];

    Object.keys(channelMonitors).forEach(async (snowflake) => {
      if (!channelMonitors[snowflake].initialised) {
        await channelMonitors[snowflake].init();
      }
      monitoredNames.push(channelMonitors[snowflake].name!);
      displayNames.push(channelMonitors[snowflake].displayChannelName!);
    });

    const lines = [];

    for (let i = 0; i < monitoredNames.length; i++) {
      lines.push(`'${monitoredNames[i]}' queue is displayed in '#${displayNames[i]}'`);
    }

    const pages = Math.ceil(lines.length / 10);

    let currentPage = [];

    if (page > pages || page < 1) {
      currentPage = ['<NONE>'];
    } else {
      currentPage = lines.slice((page - 1) * 10, page * 10);
    }

    const text = `\`\`\`\n${currentPage.join('\n')}\n\nPage ${page}/${pages}\`\`\``;

    sendmessage(<TextChannel> message.channel, text);
  }
}
