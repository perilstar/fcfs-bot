const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class QueueLengthCommand extends Command {
  constructor() {
    super('queuelength', {
      aliases: ['queuelength', 'ql'],
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

    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    if (!server.channelMonitors[args.monitorChannel.id]) {
      return sendmessage(message.channel, `Error: ${args.monitorChannel.name} is not being monitored!`);
    }

    let channelMonitor = server.channelMonitors[args.monitorChannel.id];

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    return sendmessage(message.channel, `${channelMonitor.name} has ${channelMonitor.queue.length} people in it.`);
  }
}

module.exports = QueueLengthCommand;