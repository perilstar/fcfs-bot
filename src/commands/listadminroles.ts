import { Command } from 'discord-akairo';
import type { Message, Snowflake, TextChannel } from 'discord.js';
import FCFSClient from '../fcfsclient';
import sendmessage from '../util/sendmessage';

export default class ListAdminRolesCommand extends Command {
  constructor() {
    super('listadminroles', {
      aliases: ['listadminroles', 'lar'],
      quoted: true,
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
    });
  }

  // eslint-disable-next-line no-unused-vars
  async exec(message: Message, _args: any) {
    const client = <FCFSClient> this.client;

    const ds = client.dataSource;
    const server = ds.servers[message.guild!.id];

    const { adminRoles } = server;

    let lines: Array<string> = [];

    if (adminRoles.length) {
      lines = lines.concat(adminRoles.map((roleID: Snowflake) => {
        const role = message.guild!.roles.resolve(roleID);
        return `${role?.name ?? '--ERROR--'} (ID ${roleID})`;
      }));
    } else {
      lines.push('<NONE>');
    }

    const text = `\`\`\`\n${lines.join('\n')}\n\`\`\``;

    sendmessage(<TextChannel> message.channel, text);
  }
}
