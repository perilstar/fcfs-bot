const { Command } = require('discord-akairo');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');

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
          type: 'voiceChannel'
        },
        {
          id: 'displaySize',
          type: 'integer'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.displaySize) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`displaySize\`. Use fcfs!help for commands.`);
    }

    if (args.displaySize < 1 || args.displaySize > 20) {
      return sendmessage(message.channel, 'Error: `displaySize` must be between 1 and 20');
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    if (!server.channelMonitors[args.monitorChannel.id]) {
      return sendmessage(message.channel, `Error: ${args.monitorChannel.name} is not being monitored!`);
    }

    let channelMonitor = server.channelMonitors[args.monitorChannel.id];

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