const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class InfoCommand extends Command {
  constructor() {
    super('info', {
      aliases: ['info', 'wr'],
      split: 'quoted',
      channel: 'guild',
      args: [
        {
          id: 'monitorChannel',
          type: 'voiceChannel'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`monitorChannel\`. Use fcfs!help for commands.`);
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

    let lines = [
      `Monitoring: ${channelMonitor.name} (ID ${channelMonitor.id})`,
      `Display: #${channelMonitor.displayChannelName} (ID ${channelMonitor.displayChannel})`,
      `Showing the first ${channelMonitor.displaySize} people in the queue`,
      `Rejoin Window: ${channelMonitor.rejoinWindow}ms`,
      `AFK Check Duration: ${channelMonitor.afkCheckDuration}ms`,
    ];

    return sendmessage(message.channel, '**Waiting Room Info**\n```\n' + lines.join('\n') + '\n```');
  }
}

module.exports = InfoCommand;