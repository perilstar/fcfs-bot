import { Command, FailureData } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import sendmessage from '../util/sendmessage';

export default class RemoveModRoleCommand extends Command {
  constructor() {
    super('removemodrole', {
      aliases: ['removemodrole', 'remove-modrole', 'rmr'],
      quoted: true,
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'role',
          type: 'roleCustom',
          otherwise: (msg: Message, { failure }: FailureData) => apf(msg, 'role', <ArgParseFailure> failure),
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;
    const ds = client.dataSource;
    const server = ds.servers[message.guild!.id];

    const { modRoles } = server;

    if (!modRoles.includes(args.role.id)) {
      sendmessage(<TextChannel> message.channel, `Error: ${args.role.name} is not set as bot mod!`);
      return;
    }

    const index = server.modRoles.indexOf(args.role.id);
    server.modRoles.splice(index, 1);
    ds.saveServer(server.id);

    sendmessage(<TextChannel> message.channel, `Successfully removed role ${args.role.name} as bot mod!`);
  }
}
