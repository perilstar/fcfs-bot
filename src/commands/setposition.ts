import { Command, FailureData, Flag } from 'discord-akairo';
import { Message, TextChannel, User } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import mpsMod from '../util/mps_mod';
import sendmessage from '../util/sendmessage';

export default class SetPositionCommand extends Command {
  constructor() {
    super('setposition', {
      aliases: ['setposition', 'sp'],
      quoted: true,
      userPermissions: (message) => mpsMod(<FCFSClient> this.client, message),
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'queuedMember',
          // eslint-disable-next-line arrow-body-style
          otherwise: (msg: Message, { failure }: FailureData) => {
            return apf(msg, 'member', <ArgParseFailure> failure);
          },
        },
        {
          id: 'position',
          type: (_message: Message, phrase: string) => {
            if (!phrase) return Flag.fail({ reason: 'missingArg' });
            const n = parseFloat(phrase);
            if (Number.isNaN(n)) return Flag.fail({ reason: 'notANumber', phrase });
            return n;
          },
          // eslint-disable-next-line arrow-body-style
          otherwise: (msg: Message, { failure }: FailureData) => {
            return apf(msg, 'position', <ArgParseFailure> failure);
          },
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;

    const ds = client.dataSource;
    const server = ds.servers[message.guild!.id];
    const channelMonitor = server.channelMonitors[args.member.voice.channelID];

    const position = args.position - 1;
    const index = channelMonitor.queue.findIndex((user) => user.id === args.member.id);
    channelMonitor.queue.splice(index, 1);

    channelMonitor.queue = (<Array<User>> []).concat(
      channelMonitor.queue.slice(0, position),
      args.member.user,
      channelMonitor.queue.slice(position),
    );

    const newPosition = channelMonitor.queue.findIndex((user) => user.id === args.member.id) + 1;
    channelMonitor.timeoutUpdateDisplay();
    ds.saveMonitor(channelMonitor.id);

    sendmessage(
      <TextChannel> message.channel,
      `${args.member.displayName}'s new position in ${channelMonitor.name}: ${newPosition}`,
    );
  }
}
