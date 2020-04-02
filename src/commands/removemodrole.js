const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');
const sendmessage = require('../util/sendmessage');

class RemoveModRoleCommand extends Command {
  constructor() {
    super('removemodrole', {
      aliases: ['removemodrole', 'remove-modrole', 'rmr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'voiceChannel'
        },
        {
          id: 'role',
          type: 'role'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }

    if (!args.role) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`role\`. Use fcfs!help for commands.`);
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

    let modRoles = channelMonitor.modRoles;

    if (!modRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is not a mod for ${channelMonitor.name}!`);
    }

    let index = channelMonitor.modRoles.indexOf(args.role.id);
    channelMonitor.modRoles.splice(index, 1);
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, `Successfully removed ${args.role.name} as a mod for ${channelMonitor.name}!`);
  }
}

module.exports = RemoveModRoleCommand;