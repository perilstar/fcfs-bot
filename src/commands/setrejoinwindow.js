const { Command } = require('discord-akairo');
const parseDuration = require('parse-duration');
const mps = require('../util/missingpermissionsupplier');
const sendmessage = require('../util/sendmessage');

class SetRejoinWindowCommand extends Command {
  constructor() {
    super('setrejoinwindow', {
      aliases: ['setrejoinwindow', 'set-rejoinwindow', 'set-rejoin-window', 'srw'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'string'
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
      return sendmessage(message.channel, `Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.rejoinWindow) {
      return sendmessage(message.channel, `Error: Missing argument: \`rejoinWindow\`. Use fcfs!help for commands.`);
    }

    let rejoinWindow = parseDuration(args.rejoinWindow);

    if (rejoinWindow < 0 || rejoinWindow > 600000) {
      return sendmessage(message.channel, 'Error: `rejoinWindow` must be between 0 sec and 10 min');
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let monitorChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.monitorChannel.toLowerCase());

    if (!server.channelMonitors[monitorChannel.id]) {
      return sendmessage(message.channel, `Error: couldn't find a channel called \`${args.monitorChannel}\` that's being monitored!`);
    }

    let channelMonitor = server.channelMonitors[monitorChannel.id]

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    channelMonitor.rejoinWindow = rejoinWindow;
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, 'Successfully changed!');
  }
}

module.exports = SetRejoinWindowCommand;