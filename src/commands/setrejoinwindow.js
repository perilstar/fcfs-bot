const { Command } = require('discord-akairo');
const parseDuration = require('parse-duration');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');

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
          type: 'voiceChannel'
        },
        {
          id: 'rejoinWindow',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.rejoinWindow) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`rejoinWindow\`. Use fcfs!help for commands.`);
    }

    let rejoinWindow = parseDuration(args.rejoinWindow);

    if (rejoinWindow < 0 || rejoinWindow > 600000) {
      return sendmessage(message.channel, 'Error: `rejoinWindow` must be between 0 sec and 10 min');
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    if (!server.channelMonitors[args.monitorChannel.id]) {
      return sendmessage(message.channel, `Error: ${args.monitorChannel.name} is not being monitored!`);
    }
    

    let channelMonitor = server.channelMonitors[args.monitorChannel.id]

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    channelMonitor.rejoinWindow = rejoinWindow;
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, `Successfully changed rejoin window for ${channelMonitor.name} to ${rejoinWindow}ms!`);  }
}

module.exports = SetRejoinWindowCommand;