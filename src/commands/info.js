const { Command } = require('discord-akairo');
const prettyMS = require('pretty-ms');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');

class InfoCommand extends Command {
  constructor() {
    super('info', {
      aliases: ['info', 'wr'],
      split: 'quoted',
      channel: 'guild',
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          otherwise: (msg, { failure }) => apf(this.client, msg, 'monitorChannel', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    let channelMonitor = args.monitorChannel;

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    let lines = [
      `Monitoring: ${channelMonitor.name} (ID ${channelMonitor.id})`,
      `Display: #${channelMonitor.displayChannelName} (ID ${channelMonitor.displayChannel})`,
      `Showing the first ${channelMonitor.displaySize} people in the queue`,
      `Rejoin Window: ${prettyMS(channelMonitor.rejoinWindow)}`,
      `AFK Check Duration: ${prettyMS(channelMonitor.afkCheckDuration)}`,
    ];

    return sendmessage(message.channel, '**Waiting Room Info**\n```\n' + lines.join('\n') + '\n```');
  }
}

module.exports = InfoCommand;