const { Command, Argument, Flag } = require('discord-akairo');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');
const Constants = require('../util/constants');

class SetDisplaySizeCommand extends Command {
  constructor() {
    super('setdisplaysize', {
      aliases: ['setdisplaysize', 'set-displaysize', 'set-display-size', 'sds'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          otherwise: (msg, { failure }) => apf(this.client, msg, 'monitorChannel', failure)
        },
        {
          id: 'displaySize',
          type: async (message, phrase) => {
            const n = this.client.commandHandler.resolver.type('required')(message, phrase);
            if (Argument.isFailure(n)) return n;
            const min = Constants.DisplaySize.MIN;
            const max = Constants.DisplaySize.MAX;
            const result = await Argument.range('integer', min, max, true).call(this, message, phrase);
            if (Argument.isFailure(result)) return Flag.fail({ reason: 'outOfRange', n, min, max });
            return n;
          },
          otherwise: (msg, { failure }) => apf(this.client, msg, 'displaySize', failure)
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

    channelMonitor.displaySize = args.displaySize;
    channelMonitor.updateDisplay();
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, `Successfully changed queue max display length for ${channelMonitor.name} to ${args.displaySize}!`);
  }
}

module.exports = SetDisplaySizeCommand;