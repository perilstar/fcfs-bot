const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

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
          type: 'role'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.role) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`role\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    let adminRoles = server.adminRoles;

    if (adminRoles.length >= 10) {
      return sendmessage(message.channel, `Error: You can not add more than 10 roles as bot admin!`);
    }

    if (adminRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is already set as bot admin!`);
    }

    server.adminRoles.push(args.role.id);
    ds.saveServer(server.id);

    return sendmessage(message.channel, `Successfully added role ${args.role.name} as a bot admin!`);
  }
}

module.exports = AddAdminRoleCommand;