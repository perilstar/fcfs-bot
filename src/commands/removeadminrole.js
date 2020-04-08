const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

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

    if (!adminRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is not set as bot admin!`);
    }

    let index = server.adminRoles.indexOf(args.role.id);
    server.adminRoles.splice(index, 1);
    ds.saveServer(server.id);

    return sendmessage(message.channel, `Successfully removed role ${args.role.name} as bot admin!`);
  }
}

module.exports = RemoveAdminRoleCommand;