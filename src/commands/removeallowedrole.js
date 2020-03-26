const { Command } = require('discord-akairo');

class RemoveAllowedRoleCommand extends Command {
  constructor() {
    super('removeallowedrole', {
      aliases: ['removeallowedrole', 'remove-allowedrole', 'rar'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'monitorChannel',
          type: 'string'
        },
        {
          id: 'role',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return message.channel.send(`Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }

    if (!args.role) {
      return message.channel.send(`Error: Missing argument: \`role\`. Use fcfs!help for commands.`);
    }

    let role = message.guild.roles.cache.find(r => r.name === args.role);

    if (!role) {
      return message.channel.send(`Error: Couldn't find a role called \`${args.role}\`!`);
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

    let allowedRoles = channelMonitor.allowedRoles;

    if (!allowedRoles.includes(role.id)) {
      return message.channel.send(`Error: That role is not added to the waiting room!`);
    }

    let index = channelMonitor.allowedRoles.indexOf(role.id);
    channelMonitor.allowedRoles.splice(index, 1);
    ds.saveMonitor(channelMonitor.id);

    message.channel.send('Successfully removed role!');
  }
}

module.exports = RemoveAllowedRoleCommand;