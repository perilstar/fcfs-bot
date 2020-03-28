const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');

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
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let adminRoles = server.adminRoles

    if (adminRoles.length) {
      lines = lines.concat(adminRoles.map(roleID => {
        let role = message.guild.roles.resolve(roleID);
        return `  ${role.name} (ID ${roleID})`;
      }))
    } else {
      lines.push('  <NONE>');
    }

    let text = '```\n' + lines.join('\n') + '\n```';

    message.channel.send(text);
  }
}

module.exports = ListAdminRolesCommand;