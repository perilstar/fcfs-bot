const { Command } = require('discord-akairo');
const mps_admin = require('../util/mps_admin');
const parseDuration = require('parse-duration');
const prettyMS = require('pretty-ms');
const sendmessage = require('../util/sendmessage');

class SetDisplaySizeCommand extends Command {
  constructor() {
    super('setautomatic', {
      aliases: ['setautomatic', 'set-automatic', 'sa'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'voiceChannel'
        },
        {
          id: 'interval',
          type: 'string'
        },
        {
          id: 'outputChannel',
          type: 'textChannel'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.interval) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`interval\`. Use fcfs!help for commands.`);
    }

    let interval = -1;
    if (args.interval.toLowerCase() !== 'off') {
      interval = parseDuration(args.interval);
    }

    let outputChannel = args.outputChannel ? args.outputChannel : message.channel;

    if (interval !== -1 && (interval < parseDuration('30m') || interval > parseDuration('4h'))) {
      return sendmessage(message.channel, 'Error: `interval` must be between 30 min and 4 hrs');
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

    let nextCheck = channelMonitor.afkCheckScheduler.changeInterval(interval);
    channelMonitor.autoOutput = outputChannel.id;
    ds.saveMonitor(channelMonitor.id);

    let msg = `Successfully changed automatic mode for ${channelMonitor.name} to ${interval === -1 ? 'OFF' : prettyMS(interval)}`;
    if (interval !== -1) msg += `,\noutputting to ${outputChannel}! Next automatic check in ${prettyMS(nextCheck)}`;

    return sendmessage(message.channel, msg);
  }
}

module.exports = SetDisplaySizeCommand;