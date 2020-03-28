const { Command } = require('discord-akairo');
const parseDuration = require('parse-duration');
const mps = require('../util/missingpermissionsupplier');
const sendmessage = require('../util/sendmessage');

class SetRestrictedModeCommand extends Command {
  constructor() {
    super('setrestrictedmode', {
      aliases: ['setrestrictedmode', 'set-restrictedmode', 'set-restricted-mode', 'srm'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps(this.client, message),
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
      return sendmessage(message.channel, `Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.rejoinWindow) {
      return sendmessage(message.channel, `Error: Missing argument: \`rejoinWindow\`. Use fcfs!help for commands.`);
    }

    let restrictedMode = args.restrictedMode.toLowerCase();

    if (!(restrictedMode === 'on' || restrictedMode === 'off')) {
      return sendmessage(message.channel, 'Error: `restrictedMode` must be either `on` or `off`');
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

    channelMonitor.restrictedMode = restrictedMode;
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, 'Successfully changed!');
  }
}

module.exports = SetRestrictedModeCommand;