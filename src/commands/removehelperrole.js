const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');

class RemoveHelperRoleCommand extends Command {
  constructor() {
    super('removehelperrole', {
      aliases: ['removehelperrole', 'remove-helperrole', 'rhr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'role',
          type: 'roleCustom',
          otherwise: (msg, { failure }) => apf(msg, 'role', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    let helperRoles = server.helperRoles;

    if (!helperRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is not set as bot helper!`);
    }

    let index = server.helperRoles.indexOf(args.role.id);
    server.helperRoles.splice(index, 1);
    ds.saveServer(server.id);

    return sendmessage(message.channel, `Successfully removed role ${args.role.name} as bot helper!`);
  }
}

module.exports = RemoveHelperRoleCommand;