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
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.role) {
      return sendmessage(message.channel, `Error: Missing argument: \`role\`. Use fcfs!help for commands.`);
    }

    let role = message.guild.roles.cache.find(r => r.name === args.role);

    if (!role) {
      return sendmessage(message.channel, `Error: Couldn't find a role called \`${args.role}\`!`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let adminRoles = server.adminRoles;

    if (!adminRoles.includes(role.id)) {
      return sendmessage(message.channel, `Error: That role is not set as bot admin!`);
    }

    let index = server.adminRoles.indexOf(role.id);
    server.modRoles.splice(index, 1);
    ds.saveServer(server.id);

    return sendmessage(message.channel, 'Successfully removed role!');
  }
}

module.exports = RemoveAdminRoleCommand;