const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');
const Constants = require('../util/constants');

class AddHelperRoleCommand extends Command {
  constructor() {
    super('addhelperrole', {
      aliases: ['addhelperrole', 'add-helperrole', 'ahr'],
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

    if (helperRoles.length >= Constants.AddedRoles.MAX) {
      return sendmessage(message.channel, `Error: You can not add more than ${Constants.AddedRoles.MAX} roles as bot helper!`);
    }

    if (helperRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is already set as bot helper!`);
    }

    server.helperRoles.push(args.role.id);
    ds.saveServer(server.id);

    return sendmessage(message.channel, `Successfully added role ${args.role.name} as a bot helper!`);
  }
}

module.exports = AddHelperRoleCommand;