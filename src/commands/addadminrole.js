const { Command } = require('discord-akairo');

class AddAdminRoleCommand extends Command {
  constructor() {
    super('addadminrole', {
      aliases: ['addadminrole', 'add-adminrole', 'aar'],
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
      return sendmessage(message.channel, `Error: Missing argument: \`role\`. Use fcfs!help for commands.`);
    }

    let role = message.guild.roles.cache.find(r => r.name === args.role);

    if (!role) {
      return sendmessage(message.channel, `Error: Couldn't find a role called \`${args.role}\`!`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let adminRoles = server.adminRoles;

    if (adminRoles.length >= 10) {
      return sendmessage(message.channel, `Error: You can not add more than 10 roles as bot admin!`);
    }

    if (adminRoles.includes(role.id)) {
      return sendmessage(message.channel, `Error: That role is already set as bot admin!`);
    }

    server.adminRoles.push(role.id);
    ds.saveServer(server.id);

    return sendmessage(message.channel, 'Successfully added role!');
  }
}

module.exports = AddAdminRoleCommand;