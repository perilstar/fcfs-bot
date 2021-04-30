import { Command, FailureData } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import Constants from '../util/constants';
import sendmessage from '../util/sendmessage';

export default class AddModRoleCommand extends Command {
  constructor() {
    super('addmodrole', {
      aliases: ['addmodrole', 'add-modrole', 'amr'],
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

    if (modRoles.length >= Constants.AddedRoles.MAX) {
      sendmessage(
        <TextChannel> message.channel,
        `Error: You can not add more than ${Constants.AddedRoles.MAX} roles as bot mod!`,
      );
      return;
    }

    if (modRoles.includes(args.role.id)) {
      sendmessage(<TextChannel> message.channel, `Error: ${args.role.name} is already set as bot mod!`);
      return;
    }

    server.modRoles.push(args.role.id);
    ds.saveServer(server.id);

    sendmessage(<TextChannel> message.channel, `Successfully added role ${args.role.name} as a bot mod!`);
  }
}
