import { Command, FailureData } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import mpsAdmin from '../util/mps_admin';
import sendmessage from '../util/sendmessage';

export default class DeleteWaitingRoomCommand extends Command {
  constructor() {
    super('deletewaitingroom', {
      aliases: ['deletewaitingroom', 'dwr'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsAdmin(<FCFSClient> this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          // eslint-disable-next-line arrow-body-style
          otherwise: (msg: Message, { failure }: FailureData) => {
            return apf(msg, 'afkCheckDuration', <ArgParseFailure> failure);
          },
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;

    const ds = client.dataSource;
    ds.removeMonitor(message.guild!.id, args.monitorChannel.id);

    sendmessage(<TextChannel> message.channel, 'Successfully deleted!');
  }
}
