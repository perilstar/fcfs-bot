const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class ListHelperRolesCommand extends Command {
  constructor() {
    super('listhelperroles', {
      aliases: ['listhelperroles', 'lhr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let helperRoles = server.helperRoles

    let lines = [];

    if (helperRoles.length) {
      lines = lines.concat(helperRoles.map(roleID => {
        let role = message.guild.roles.resolve(roleID);
        return `${role.name} (ID ${roleID})`;
      }))
    } else {
      lines.push('<NONE>');
    }

    let text = '```\n' + lines.join('\n') + '\n```';

    return sendmessage(message.channel, text);
  }
}

module.exports = ListHelperRolesCommand;