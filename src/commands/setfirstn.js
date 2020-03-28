const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');
const sendmessage = require('../util/sendmessage');

class SetFirstNCommand extends Command {
  constructor() {
    super('setfirstn', {
      aliases: ['setfirstn', 'set-firstn', 'set-first-n', 'sfn'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'string'
        },
        {
          id: 'firstN',
          type: 'number'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.firstN) {
      return sendmessage(message.channel, `Error: Missing argument: \`firstN\`. Use fcfs!help for commands.`);
    }

    if (args.firstN < 1 || args.firstN > 25) {
      return sendmessage(message.channel, 'Error: `firstN` must be between 1 and 25');
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

    channelMonitor.firstN = args.firstN;
    channelMonitor.updateDisplay();
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, 'Successfully changed!');
  }
}

module.exports = SetFirstNCommand;