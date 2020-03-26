const { Command } = require('discord-akairo');

class AddAllowedRoleCommand extends Command {
  constructor() {
    super('addallowedrole', {
      aliases: ['addallowedrole', 'add-allowedrole', 'aar'],
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

    if (allowedRoles.length >= 10) {
      return message.channel.send(`Error: You can not add more than 10 roles per waiting room!`);
    }

    if (allowedRoles.includes(role.id)) {
      return message.channel.send(`Error: That role is already added to the waiting room!`);
    }

    channelMonitor.allowedRoles.push(role.id);
    ds.saveMonitor(channelMonitor.id);

    message.channel.send('Successfully added role!');
  }
}

module.exports = AddAllowedRoleCommand;