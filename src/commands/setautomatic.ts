import {
  Argument, ArgumentOptions, Command, FailureData, Flag,
} from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import parseDuration from 'parse-duration';
import prettyMS from 'pretty-ms';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import Constants from '../util/constants';
import mpsAdmin from '../util/mps_admin';
import sendmessage from '../util/sendmessage';

export default class SetDisplaySizeCommand extends Command {
  constructor() {
    super('setautomatic', {
      aliases: ['setautomatic', 'set-automatic', 'sa'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsAdmin(<FCFSClient> this.client, message),
      // eslint-disable-next-line no-unused-vars
    });
  }

  * args(): IterableIterator<(ArgumentOptions | Flag)> {
    const client = <FCFSClient> this.client;

    const monitorChannel = yield {
      type: 'monitorChannel',
      // eslint-disable-next-line arrow-body-style
      otherwise: (msg: Message, { failure }: FailureData) => {
        return apf(msg, 'monitorChannel', <ArgParseFailure> failure);
      },
    };
    const interval = yield {
      type: async (message: Message, phrase: string) => {
        const min = Constants.Interval.MIN;
        const max = Constants.Interval.MAX;
        const result = await Argument.union(
          Argument.compose(
            'duration',
            Argument.range('integer', parseDuration(min)!, parseDuration(max)!, true),
          ),
          Argument.validate('lowercase', (_m: Message, _p: string, v: string) => v === 'off'),
        ).call(this, message, phrase);
        if (Argument.isFailure(result)) {
          return Flag.fail({
            reason: 'invalidInterval', n: result, min, max,
          });
        }
        return result;
      },
      // eslint-disable-next-line arrow-body-style
      otherwise: (msg: Message, { failure }: FailureData) => {
        return apf(msg, 'interval', <ArgParseFailure> failure);
      },
    };

    const outputChannel = yield {
      type: (message: Message, phrase: string) => {
        if (interval === -1) {
          return null;
        }

        if (phrase === '') {
          return message.channel;
        }
        return client.commandHandler.resolver.type('textChannelCustom')(message, phrase);
      },
      // eslint-disable-next-line arrow-body-style
      otherwise: (msg: Message, { failure }: FailureData) => {
        return apf(msg, 'outputChannel', <ArgParseFailure> failure);
      },
    };
    return { monitorChannel, interval, outputChannel };
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;

    const ds = client.dataSource;

    const channelMonitor = args.monitorChannel;

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    const { outputChannel } = args;

    const nextCheck = channelMonitor.afkCheckScheduler.changeInterval(args.interval === 'off' ? -1 : args.interval);
    channelMonitor.autoOutput = outputChannel ? outputChannel.id : '';
    ds.saveMonitor(channelMonitor.id);

    // eslint-disable-next-line max-len
    let msg = `Successfully changed automatic mode for ${channelMonitor.name} to ${args.interval === 'off' ? 'OFF' : prettyMS(args.interval)}`;
    // eslint-disable-next-line max-len
    if (args.interval !== 'off') msg += `,\noutputting to ${outputChannel.toString()}! Next automatic check in ${prettyMS(nextCheck)}`;

    sendmessage(<TextChannel> message.channel, msg);
  }
}
