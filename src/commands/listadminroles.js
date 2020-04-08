const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class ListAdminRolesCommand extends Command {
  constructor() {
    super('listadminroles', {
      aliases: ['listadminroles', 'lar'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    let adminRoles = server.adminRoles;

    let lines = [];

    if (adminRoles.length) {
      lines = lines.concat(adminRoles.map(roleID => {
        let role = message.guild.roles.resolve(roleID);
        return `${role.name} (ID ${roleID})`;
      }));
    } else {
      lines.push('<NONE>');
    }

    let text = '```\n' + lines.join('\n') + '\n```';

    return sendmessage(message.channel, text);
  }
}

module.exports = ListAdminRolesCommand;