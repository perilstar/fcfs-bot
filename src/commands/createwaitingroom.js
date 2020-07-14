const { Command, Argument, Flag } = require('discord-akairo');
const parseDuration = require('parse-duration');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');
const Constants = require('../util/constants');

class CreateWaitingRoomCommand extends Command {
  constructor() {
    super('createwaitingroom', {
      aliases: ['createwaitingroom', 'cwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'voiceChannelCustom',
          otherwise: (msg, { failure }) => apf(msg, 'monitorChannel', failure)
        },
        {
          id: 'displaySize',
          type: async (message, phrase) => {
            if (!phrase) return Flag.fail({ reason: 'missingArg' });
            const n = phrase;
            const min = Constants.DisplaySize.MIN;
            const max = Constants.DisplaySize.MAX;
            const result = await Argument.range('integer', min, max, true).call(this, message, phrase);
            if (Argument.isFailure(result)) return Flag.fail({ reason: 'outOfRange', n, min, max });
            return n;
            },
          otherwise: (msg, { failure }) => apf(msg, 'displaySize', failure)
        },
        {
          id: 'rejoinWindow',
          type: (message, phrase) => {
            let n = this.client.commandHandler.resolver.type('duration')(message, phrase);
            const min = Constants.RejoinWindow.MIN;
            const max = Constants.RejoinWindow.MAX;
            if (n < parseDuration(min) || n > parseDuration(max)) return Flag.fail({ reason: 'outOfRange', n, min, max });
            return n;
          },
          otherwise: (msg, { failure }) => apf(msg, 'rejoinWindow', failure)
        },
        {
          id: 'afkCheckDuration',
          type: (message, phrase) => {
            let n = this.client.commandHandler.resolver.type('duration')(message, phrase);
            const min = Constants.AFKCheckDuration.MIN;
            const max = Constants.AFKCheckDuration.MAX;
            if (n < parseDuration(min) || n > parseDuration(max)) return Flag.fail({ reason: 'outOfRange', n, min, max });
            return n;
          },
          otherwise: (msg, { failure }) => apf(msg, 'afkCheckDuration', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    let displayChannel = message.channel;

    let displayMessage = await message.channel.send('<Pending Update>').catch(() => {});

    let data = {
      guildID: message.guild.id,
      id: args.monitorChannel.id,
      displayChannel: displayChannel.id,
      displayMessage: displayMessage.id,
      displaySize: args.displaySize,
      rejoinWindow: args.rejoinWindow,
      afkCheckDuration: args.afkCheckDuration,
      snowflakeQueue: [],
      automatic: -1,
      auto_output: '',
    };

    message.delete();

    let channelMonitor = server.addChannelMonitor(data);
    await channelMonitor.init();
    
    this.client.dataSource.saveMonitor(args.monitorChannel.id);
  }
}

module.exports = CreateWaitingRoomCommand;