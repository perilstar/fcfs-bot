const { Command } = require('discord-akairo');
const parseDuration = require('parse-duration');

class SetRestrictedModeCommand extends Command {
  constructor() {
    super('setrestrictedmode', {
      aliases: ['setrestrictedmode', 'set-restrictedmode', 'set-restricted-mode', 'srm'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'monitorChannel',
          type: 'string'
        },
        {
          id: 'restrictedMode',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return message.channel.send(`Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.rejoinWindow) {
      return message.channel.send(`Error: Missing argument: \`rejoinWindow\`. Use fcfs!help for commands.`);
    }

    let restrictedMode = args.restrictedMode.toLowerCase();

    if (!(restrictedMode === 'on' || restrictedMode === 'off')) {
      return message.channel.send('Error: `restrictedMode` must be either `on` or `off`');
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let monitorChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.monitorChannel.toLowerCase());

    if (!server.channelMonitors[monitorChannel.id]) {
      return message.channel.send(`Error: couldn't find a channel called \`${args.monitorChannel}\` that's being monitored!`);
    }

    let channelMonitor = server.channelMonitors[monitorChannel.id]

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    channelMonitor.restrictedMode = restrictedMode;
    ds.saveMonitor(channelMonitor.id);

    message.channel.send('Successfully changed!');
  }
}

module.exports = SetRestrictedModeCommand;