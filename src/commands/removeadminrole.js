const { Command } = require('discord-akairo');

class RemoveAdminRoleCommand extends Command {
  constructor() {
    super('removeadminrole', {
      aliases: ['removeadminrole', 'remove-adminrole', 'rar'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'role',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.role) {
      return message.channel.send(`Error: Missing argument: \`role\`. Use fcfs!help for commands.`);
    }

    let role = message.guild.roles.cache.find(r => r.name === args.role);

    if (!role) {
      return message.channel.send(`Error: Couldn't find a role called \`${args.role}\`!`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let adminRoles = server.adminRoles;

    if (!adminRoles.includes(role.id)) {
      return message.channel.send(`Error: That role is not set as bot admin!`);
    }

    let index = server.adminRoles.indexOf(role.id);
    server.modRoles.splice(index, 1);
    ds.saveServer(server.id);

    message.channel.send('Successfully removed role!');
  }
}

module.exports = RemoveAdminRoleCommand;