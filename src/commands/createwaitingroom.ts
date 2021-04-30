import {
  Argument, Command, FailureData, Flag,
} from 'discord-akairo';
import type { Message } from 'discord.js';
import parseDuration from 'parse-duration';
import type FCFSClient from '../fcfsclient';
import type { ChannelMonitorData } from '../struct/channel_monitor';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import Constants from '../util/constants';
import mpsAdmin from '../util/mps_admin';

export default class CreateWaitingRoomCommand extends Command {
  constructor() {
    super('createwaitingroom', {
      aliases: ['createwaitingroom', 'cwr'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsAdmin(<FCFSClient> this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'voiceChannelCustom',
          otherwise: (msg: Message, { failure }: FailureData) => apf(msg, 'monitorChannel', <ArgParseFailure> failure),
        },
        {
          id: 'displaySize',
          type: async (message, phrase) => {
            if (!phrase) return Flag.fail({ reason: 'missingArg' });
            const n = phrase;
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
          otherwise: (msg: Message, { failure }: FailureData) => apf(msg, 'displaySize', <ArgParseFailure> failure),
        },
        {
          id: 'rejoinWindow',
          type: (message, phrase) => {
            const n = (<FCFSClient> this.client).commandHandler.resolver.type('duration')(message, phrase);
            const min = Constants.RejoinWindow.MIN;
            const max = Constants.RejoinWindow.MAX;
            if (n < parseDuration(min)! || n > parseDuration(max)!) {
              return Flag.fail({
                reason: 'outOfRange', n, min, max,
              });
            }
            return n;
          },
          otherwise: (msg: Message, { failure }: FailureData) => apf(msg, 'rejoinWindow', <ArgParseFailure> failure),
        },
        {
          id: 'afkCheckDuration',
          type: (message, phrase) => {
            const n = (<FCFSClient> this.client).commandHandler.resolver.type('duration')(message, phrase);
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
    const server = ds.servers[message.guild!.id];

    const displayChannel = message.channel;

    const displayMessage = await message.channel.send('<Pending Update>').catch(() => {});

    if (!displayMessage) {
      console.log('Failure creating a waiting room\'s display message!');
      return;
    }

    const data: ChannelMonitorData = {
      guildID: message.guild!.id,
      id: args.monitorChannel.id,
      displayChannel: displayChannel.id,
      displayMessage: displayMessage.id,
      displaySize: args.displaySize,
      rejoinWindow: args.rejoinWindow,
      afkCheckDuration: args.afkCheckDuration,
      snowflakeQueue: [],
      automatic: -1,
      autoOutput: '',
    };

    message.delete();

    const channelMonitor = server.addChannelMonitor(data);
    await channelMonitor.init();

    ds.saveMonitor(args.monitorChannel.id);
  }
}
