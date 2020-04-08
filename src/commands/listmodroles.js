const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class ListModRolesCommand extends Command {
  constructor() {
    super('listmodroles', {
      aliases: ['listmodroles', 'lmr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    let modRoles = server.modRoles;

    let lines = [];

    if (modRoles.length) {
      lines = lines.concat(modRoles.map(roleID => {
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

module.exports = ListModRolesCommand;