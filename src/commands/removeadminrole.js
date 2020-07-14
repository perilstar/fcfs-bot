const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');

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
          type: 'roleCustom',
          otherwise: (msg, { failure }) => apf(this.client, msg, 'role', failure)
        }
      ]
    });
  }

  async exec(message, args) {
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