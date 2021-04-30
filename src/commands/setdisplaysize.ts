import {
  Argument, Command, FailureData, Flag,
} from 'discord-akairo';
import type { TextChannel } from 'discord.js';
import { Message } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import Constants from '../util/constants';
import mpsAdmin from '../util/mps_admin';
import sendmessage from '../util/sendmessage';

export default class SetDisplaySizeCommand extends Command {
  constructor() {
    super('setdisplaysize', {
      aliases: ['setdisplaysize', 'set-displaysize', 'set-display-size', 'sds'],
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
          id: 'displaySize',
          type: async (message, phrase) => {
            const client = <FCFSClient> this.client;

            const n = client.commandHandler.resolver.type('required')(message, phrase);
            if (Argument.isFailure(n)) return n;
            const min = Constants.DisplaySize.MIN;
            const max = Constants.DisplaySize.MAX;
            const result = await Argument.range('integer', min, max, true).call(this, message, phrase);
            if (Argument.isFailure(result)) {
              return Flag.fail({
                reason: 'outOfRange', n, min, max,
              });
            }
            return n;
          },
          // eslint-disable-next-line arrow-body-style
          otherwise: (msg: Message, { failure }: FailureData) => {
            return apf(msg, 'displaySize', <ArgParseFailure> failure);
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

    channelMonitor.displaySize = args.displaySize;
    channelMonitor.updateDisplay();
    ds.saveMonitor(channelMonitor.id);

    sendmessage(
      <TextChannel> message.channel,
      `Successfully changed queue max display length for ${channelMonitor.name} to ${args.displaySize}!`,
    );
  }
}
