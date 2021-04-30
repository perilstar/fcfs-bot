import {
  Argument, Command, FailureData, Flag,
} from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import parseDuration from 'parse-duration';
import prettyMS from 'pretty-ms';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import Constants from '../util/constants';
import mpsAdmin from '../util/mps_admin';
import sendmessage from '../util/sendmessage';

export default class SetAfkCheckDurationCommand extends Command {
  constructor() {
    super('setafkcheckduration', {
      aliases: ['setafkcheckduration', 'set-afkcheckduration', 'set-afk-check-duration', 'sacd'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsAdmin(<FCFSClient> this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          // eslint-disable-next-line arrow-body-style
          otherwise: (msg: Message, { failure }: FailureData) => {
            return apf(msg, 'monitorChannel', <ArgParseFailure> failure);
          },
        },
        {
          id: 'afkCheckDuration',
          type: (message, phrase) => {
            const client = <FCFSClient> this.client;
            const n = client.commandHandler.resolver.type('duration')(message, phrase);
            if (Argument.isFailure(n)) return n;
            const min = Constants.AFKCheckDuration.MIN;
            const max = Constants.AFKCheckDuration.MAX;
            if (n < parseDuration(min)! || n > parseDuration(max)!) {
              return Flag.fail({
                reason: 'outOfRange', n, min, max,
              });
            }
            return n;
          },
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

    const channelMonitor = args.monitorChannel;

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    channelMonitor.afkCheckDuration = args.afkCheckDuration;
    ds.saveMonitor(channelMonitor.id);

    sendmessage(
      <TextChannel> message.channel,
      `Successfully changed AFK check duration for ${channelMonitor.name} to ${prettyMS(args.afkCheckDuration)}!`,
    );
  }
}
