const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');

class RemoveModRoleCommand extends Command {
  constructor() {
    super('removemodrole', {
      aliases: ['removemodrole', 'remove-modrole', 'rmr'],
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

    let modRoles = server.modRoles;

    if (!modRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is not set as bot mod!`);
    }

    let index = server.modRoles.indexOf(args.role.id);
    server.modRoles.splice(index, 1);
    ds.saveServer(server.id);

    return sendmessage(message.channel, `Successfully removed role ${args.role.name} as bot mod!`);
  }
}

module.exports = RemoveModRoleCommand;