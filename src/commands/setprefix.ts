import { Command, FailureData, Flag } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import mpsAdmin from '../util/mps_admin';
import sendmessage from '../util/sendmessage';

export default class SetPrefixCommand extends Command {
  constructor() {
    super('setprefix', {
      aliases: ['setprefix', 'set-prefix', 'prefix'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsAdmin(<FCFSClient> this.client, message),
      args: [
        {
          id: 'prefix',
          type: (message, phrase) => {
            if (!phrase) return Flag.fail({ reason: 'missingArg' });
            return phrase;
          },
          // eslint-disable-next-line arrow-body-style
          otherwise: (msg: Message, { failure }: FailureData) => {
            return apf(msg, 'prefix', <ArgParseFailure> failure);
          },
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;

    const ds = client.dataSource;
    const server = ds.servers[message.guild!.id];

    server.prefix = args.prefix;

    client.dataSource.saveServer(message.guild!.id);

    sendmessage(<TextChannel> message.channel, `Successfully changed prefix to ${args.prefix}`);
  }
}
