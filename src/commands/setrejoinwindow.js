const { Command, Argument, Flag } = require('discord-akairo');
const parseDuration = require('parse-duration');
const prettyMS = require('pretty-ms');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');
const Constants = require('../util/constants');

class SetRejoinWindowCommand extends Command {
  constructor() {
    super('setrejoinwindow', {
      aliases: ['setrejoinwindow', 'set-rejoinwindow', 'set-rejoin-window', 'srw'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel'
        },
        {
          id: 'rejoinWindow',
          type: (message, phrase) => {
            let n = this.client.commandHandler.resolver.type('duration')(message, phrase);
            if (Argument.isFailure(n)) return n;
            const min = Constants.RejoinWindow.MIN;
            const max = Constants.RejoinWindow.MAX;
            if (n < parseDuration(min) || n > parseDuration(max)) return Flag.fail({ reason: 'outOfRange', n, min, max });
            return n;
          },
          otherwise: (msg, { failure }) => apf(msg, 'rejoinWindow', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let channelMonitor = args.monitorChannel;

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    channelMonitor.rejoinWindow = args.rejoinWindow;
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, `Successfully changed rejoin window for ${channelMonitor.name} to ${prettyMS(channelMonitor.rejoinWindow)}!`);  }
}

module.exports = SetRejoinWindowCommand;