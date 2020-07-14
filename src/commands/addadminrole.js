const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');
const Constants = require('../util/constants');

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

    if (adminRoles.length >= Constants.AddedRoles.MAX) {
      return sendmessage(message.channel, `Error: You can not add more than ${Constants.AddedRoles.MAX} roles as bot admin!`);
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