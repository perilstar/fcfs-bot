import {
  Argument, Command, FailureData, Flag,
} from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import parseDuration from 'parse-duration';
import prettyMS from 'pretty-ms';
import type FCFSClient from '../fcfsclient';
import type { ArgParseFailure } from '../util/arg_parse_failure';
import apf from '../util/arg_parse_failure';
import Constants from '../util/constants';
import mpsAdmin from '../util/mps_admin';
import sendmessage from '../util/sendmessage';

export default class SetRejoinWindowCommand extends Command {
  constructor() {
    super('setrejoinwindow', {
      aliases: ['setrejoinwindow', 'set-rejoinwindow', 'set-rejoin-window', 'srw'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsAdmin(<FCFSClient> this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
        },
        {
          id: 'rejoinWindow',
          type: (message, phrase) => {
            const client = <FCFSClient> this.client;

            const n = client.commandHandler.resolver.type('duration')(message, phrase);
            if (Argument.isFailure(n)) return n;
            const min = Constants.RejoinWindow.MIN;
            const max = Constants.RejoinWindow.MAX;
            if (n < parseDuration(min)! || n > parseDuration(max)!) {
              return Flag.fail({
                reason: 'outOfRange', n, min, max,
              });
            }
            return n;
          },
          // eslint-disable-next-line arrow-body-style
          otherwise: (msg: Message, { failure }: FailureData) => {
            return apf(msg, 'rejoinWindow', <ArgParseFailure> failure);
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

    channelMonitor.rejoinWindow = args.rejoinWindow;
    ds.saveMonitor(channelMonitor.id);

    sendmessage(
      <TextChannel> message.channel,
      `Successfully changed rejoin window for ${channelMonitor.name} to ${prettyMS(channelMonitor.rejoinWindow)}!`,
    );
  }
}
