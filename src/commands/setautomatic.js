const { Command, Argument, Flag } = require('discord-akairo');
const mps_admin = require('../util/mps_admin');
const parseDuration = require('parse-duration');
const prettyMS = require('pretty-ms');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');
const Constants = require('../util/constants');

class SetDisplaySizeCommand extends Command {
  constructor() {
    super('setautomatic', {
      aliases: ['setautomatic', 'set-automatic', 'sa'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      *args(message) {
        const monitorChannel = yield {
          type: 'monitorChannel',
          otherwise: (msg, { failure }) => apf(msg, 'monitorChannel', failure)
        };
        const interval = yield {
          type: async (message, phrase) => {
            const min = Constants.Interval.MIN;
            const max = Constants.Interval.MAX;
            const result = await Argument.union(
              Argument.compose('duration', Argument.range('integer', parseDuration(min), parseDuration(max), true)),
              Argument.validate('lowercase', (msg, phrase, value) => value === 'off')
            ).call(this, message, phrase);
            if (Argument.isFailure(result)) return Flag.fail({ reason: 'invalidInterval', n: result, min, max });
            return result;
          },
          otherwise: (msg, { failure }) => apf(msg, 'interval', failure)
        };

        const outputChannel = yield {
          type: (message, phrase) => {
            if (interval === -1) {
              return null;
            }

            if (phrase === '') {
              return message.channel;
            }
            return this.client.commandHandler.resolver.type('textChannelCustom')(message, phrase);
          },
          otherwise: (msg, { failure }) => apf(msg, 'outputChannel', failure)
        };
        return { monitorChannel, interval, outputChannel };
      }
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;

    let channelMonitor = args.monitorChannel;

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    let outputChannel = args.outputChannel;

    let nextCheck = channelMonitor.afkCheckScheduler.changeInterval(args.interval === 'off' ? -1 : args.interval);
    channelMonitor.autoOutput = outputChannel ? outputChannel.id : '';
    ds.saveMonitor(channelMonitor.id);

    let msg = `Successfully changed automatic mode for ${channelMonitor.name} to ${args.interval === 'off' ? 'OFF' : prettyMS(args.interval)}`;
    if (args.interval !== 'off') msg += `,\noutputting to ${outputChannel.toString()}! Next automatic check in ${prettyMS(nextCheck)}`;

    return sendmessage(message.channel, msg);
  }
}

module.exports = SetDisplaySizeCommand;