const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');

class AddModRoleCommand extends Command {
  constructor() {
    super('addmodrole', {
      aliases: ['addmodrole', 'add-modrole', 'amr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: mps,
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

    let modRoles = channelMonitor.modRoles;

    if (modRoles.length >= 10) {
      return message.channel.send(`Error: You can not add more than 10 mod roles per waiting room!`);
    }

    if (modRoles.includes(role.id)) {
      return message.channel.send(`Error: That mod role is already added to the waiting room!`);
    }

    channelMonitor.modRoles.push(role.id);
    ds.saveMonitor(channelMonitor.id);

    message.channel.send('Successfully added role!');
  }
}

module.exports = AddModRoleCommand;