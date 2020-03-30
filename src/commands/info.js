const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');
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
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let monitorChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.monitorChannel.toLowerCase());

    if (!monitorChannel) {
      return sendmessage(message.channel, `Error: couldn't find a channel called \`${args.monitorChannel}\`!`);
    }

    if (!server.channelMonitors[monitorChannel.id]) {
      return sendmessage(message.channel, `Error: couldn't find a channel called \`${args.monitorChannel}\` that's being monitored!`);
    }

    let channelMonitor = server.channelMonitors[monitorChannel.id]

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    let lines = [
      `Monitoring: ${channelMonitor.name} (ID ${channelMonitor.id})`,
      `Display: #${channelMonitor.displayChannelName} (ID ${channelMonitor.displayChannel})`,
      `Showing the first ${channelMonitor.firstN} people in the queue`,
      `Rejoin Window: ${channelMonitor.rejoinWindow}ms`,
      `AFK Check Duration: ${channelMonitor.afkCheckDuration}ms`,
      `Channel is ${channelMonitor.restrictedMode? '' : 'not '}in Restricted Mode`
    ];

    if (channelMonitor.restrictedMode) {
      lines.push('Roles allowed to AFK Check:');
    }

    let modRoles = channelMonitor.modRoles;

    if (modRoles.length) {
      lines = lines.concat(modRoles.map(roleID => {
        let role = message.guild.roles.resolve(roleID);
        return `  ${role.name} (ID ${roleID})`;
      }))
    } else {
      lines.push('  <NONE>');
    }

    return sendmessage(message.channel, '**Waiting Room Info**\n```\n' + lines.join('\n') + '\n```');
  }
}

module.exports = InfoCommand;